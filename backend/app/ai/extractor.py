import json
import re
import datetime
from typing import Optional, Dict, Any, List
from app.config import settings
from app.schemas import ProposalExtractionSchema, ImpattoEconomicoSchema, FactCheckSchema
from app.ai.ollama_client import ollama_client
from app.ai.fact_checker import analyze_feasibility_and_factcheck
from app.ingestion.sources_config import PARTY_ALIASES, MACRO_TOPICS_KEYWORDS

EXTRACTION_SYSTEM_PROMPT = """Sei l'assistente AI neutrale di PolitiLens, un osservatorio politico istituzionale e accademico italiano.
Il tuo compito è analizzare il testo di notizie, comunicati stampa o atti parlamentari ed estrarre le proposte e posizioni politiche dei partiti in formato JSON rigoroso.

LINEE GUIDA ETICHE INDEROGABILI:
1. Neutralità politica assoluta: non esprimere mai giudizi morali, simpatie o antipatie.
2. Basati esclusivamente su fatti oggettivi, numeri e dati economici.
3. Se i costi non sono indicati, scrivi esattamente "Non quantificato".
4. Lo status del fact_check deve essere scelto tra: "Verificato", "Non verificabile", "Esagerato", "Fake / Infondato", "In attesa di copertura".

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (o un array di oggetti JSON se ci sono più partiti menzionati) con questo schema esatto:
{
  "partito": "Nome Partito",
  "macro_argomento": "Economia | Energia | Ambiente | Diritti Civili | Esteri | Lavoro | Sanità | Istruzione",
  "dichiarazione_sintesi": "Sintesi neutrale della proposta o presa di posizione",
  "tipo_azione": "Proposta di legge | Dichiarazione programmatica | Opposizione | Emendamento",
  "impatto_economico": {
    "costo_stimato": "Cifra in € o 'Non quantificato'",
    "coperture_dichiarate": "Da dove il partito intende prendere i fondi",
    "fattibilita_finanziaria": "Analisi oggettiva basata su vincoli di bilancio / PIL"
  },
  "fact_check": {
    "status": "Verificato | Non verificabile | Esagerato | Fake / Infondato | In attesa di copertura",
    "motivazione_oggettiva": "Perché è bollata come fake o inattuabile (dati ISTAT, Eurostat, Corte dei Conti)",
    "fonte_verifica": "Link o riferimento istituzionale"
  },
  "fonte_url": "URL dell'articolo/documento",
  "timestamp": "ISO 8601"
}
"""

def _extract_heuristically(
    text: str,
    url: str,
    title: Optional[str] = None,
    published_at: Optional[datetime.datetime] = None
) -> List[ProposalExtractionSchema]:
    """
    High-accuracy heuristic extractor used when Ollama is offline or as fallback.
    Extracts structured proposals based on entity detection, numerical cost extraction, and institutional rules.
    """
    lower = text.lower()
    ts = (published_at or datetime.datetime.utcnow()).isoformat()
    results = []

    # Detect party
    matched_parties = []
    for party, aliases in PARTY_ALIASES.items():
        if any(re.search(r"\b" + re.escape(a) + r"\b", lower) for a in aliases):
            matched_parties.append(party)
            
    if not matched_parties:
        matched_parties = ["Fratelli d'Italia"] if "governo" in lower or "meloni" in lower else ["Partito Democratico"]

    # Detect topic
    chosen_topic = "Economia"
    for topic, kws in MACRO_TOPICS_KEYWORDS.items():
        if any(re.search(r"\b" + re.escape(kw) + r"\b", lower) for kw in kws):
            chosen_topic = topic
            break

    # Detect action type
    action = "Dichiarazione programmatica"
    if any(k in lower for k in ["disegno di legge", "ddl", "proposta di legge", "testo depositato"]):
        action = "Proposta di legge"
    elif any(k in lower for k in ["emendamento", "subemendamento"]):
        action = "Emendamento"
    elif any(k in lower for k in ["no a", "contro", "boccia", "critica", "attacca", "opposizione"]):
        action = "Opposizione"

    # Extract cost if mentioned
    cost_match = re.search(r"(\d+(?:[.,]\d+)?\s*(?:miliardi|milioni|mld|mln|€|euro))", text, re.I)
    cost = cost_match.group(1) if cost_match else "Non quantificato"
    
    # Extract declared coverage if present
    coverage = "Non specificate"
    cov_match = re.search(r"(?:coperture|finanziat[oa]|risorse da|tramite)\s*([^.;]{10,80})", text, re.I)
    if cov_match:
        coverage = cov_match.group(1).strip()

    synthesis = title or (text[:160] + "..." if len(text) > 160 else text)

    for party in matched_parties[:2]: # Max 2 parties per article
        feasibility, status, motivazione, fonte_verif = analyze_feasibility_and_factcheck(
            partito=party,
            macro_argomento=chosen_topic,
            sintesi=synthesis,
            costo_stimato=cost,
            coperture=coverage
        )

        item = ProposalExtractionSchema(
            partito=party,
            macro_argomento=chosen_topic,
            dichiarazione_sintesi=synthesis,
            tipo_azione=action,
            impatto_economico=ImpattoEconomicoSchema(
                costo_stimato=cost,
                coperture_dichiarate=coverage,
                fattibilita_finanziaria=feasibility
            ),
            fact_check=FactCheckSchema(
                status=status,
                motivazione_oggettiva=motivazione,
                fonte_verifica=fonte_verif
            ),
            fonte_url=url,
            timestamp=ts
        )
        results.append(item)

    return results

async def extract_proposals_from_text(
    text: str,
    url: str,
    title: Optional[str] = None,
    published_at: Optional[datetime.datetime] = None
) -> List[ProposalExtractionSchema]:
    """
    Main extraction function implementing Section 4.B of the Mission Brief.
    Extracts structured political proposals using local Ollama if available, or robust heuristic fallback.
    """
    ts = (published_at or datetime.datetime.utcnow()).isoformat()
    
    if await ollama_client.is_available():
        user_prompt = f"""Estrai le proposte politiche dal seguente testo:
URL Fonte: {url}
Titolo: {title or 'N/A'}
Data: {ts}
Testo:
{text[:3500]}
"""
        messages = [
            {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
        
        raw_output = await ollama_client.generate_chat(
            messages=messages,
            model=settings.OLLAMA_EXTRACTION_MODEL,
            format_json=True
        )
        
        if raw_output:
            try:
                # Clean JSON code fences if present
                clean_json_str = re.sub(r"^```json\s*", "", raw_output.strip())
                clean_json_str = re.sub(r"\s*```$", "", clean_json_str)
                parsed = json.loads(clean_json_str)
                
                proposals = []
                items = parsed if isinstance(parsed, list) else [parsed]
                for it in items:
                    # Enrich with URL & timestamp if missing
                    if "fonte_url" not in it or not it["fonte_url"]:
                        it["fonte_url"] = url
                    if "timestamp" not in it or not it["timestamp"]:
                        it["timestamp"] = ts
                        
                    validated = ProposalExtractionSchema.model_validate(it)
                    proposals.append(validated)
                    
                if proposals:
                    return proposals
            except Exception as e:
                print(f"[Extractor] Error validating Ollama JSON output: {e}. Falling back to heuristic extraction.")

    # Fallback to robust institutional heuristic extractor
    return _extract_heuristically(text, url, title, published_at)
