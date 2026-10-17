import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.models import PoliticalProposal, PoliticalParty
from app.schemas import ChatQueryRequest, ChatQueryResponse, CitationItem
from app.ai.embeddings import get_text_embedding, cosine_similarity
from app.ai.ollama_client import ollama_client

RAG_SYSTEM_PROMPT = """Sei PolitiLens AI, un assistente virtuale comparativo e rigorosamente neutrale per la politica italiana.
Operi secondo i principi di massima imparzialità, trasparenza e rigore enciclopedico.

REGOLE INDEROGABILI:
1. NEUTRALITÀ ASSOLUTA: Non esprimere MAI opinioni personali, preferenze elettorali o giudizi morali.
2. CONFRONTO EQUILIBRATO: Presenta sempre le posizioni dei vari schieramenti (maggioranza e opposizione) con uguale spazio e rispetto istituzionale.
3. TRACCIABILITÀ DELLE FONTI: Ogni affermazione o spesa deve fare esplicito riferimento al partito proponente, alla data e allo status di fact-checking/fattibilità.
4. FACT-CHECKING FINANZIARIO: Riporta sempre se i costi sono quantificati e quali coperture sono state formalmente indicate.
5. Usa formattazione Markdown chiara (elenchi puntati, tabelle comparative o sezioni distinte per partito).
"""

async def answer_rag_query(req: ChatQueryRequest, db: Session) -> ChatQueryResponse:
    """
    RAG Chatbot query handler:
    1. Computes query embedding.
    2. Retrieves top-k matching proposals from the database via cosine similarity.
    3. Formats evidence and citations.
    4. Generates an objective encyclopedic response with Ollama (or structured rule-based synthesizer fallback).
    """
    query_vec = await get_text_embedding(req.question)
    
    # Query proposals from database
    query = db.query(PoliticalProposal)
    if req.filter_party:
        query = query.filter(PoliticalProposal.partito.ilike(f"%{req.filter_party}%"))
    if req.filter_macro_argomento:
        query = query.filter(PoliticalProposal.macro_argomento.ilike(f"%{req.filter_macro_argomento}%"))
        
    all_proposals = query.all()
    
    scored_proposals = []
    for prop in all_proposals:
        score = 0.0
        if prop.embedding:
            try:
                emb = json.loads(prop.embedding)
                score = cosine_similarity(query_vec, emb)
            except Exception:
                pass
        else:
            # Simple keyword overlap heuristic if no embedding
            text = f"{prop.partito} {prop.macro_argomento} {prop.dichiarazione_sintesi}".lower()
            q_words = req.question.lower().split()
            matches = sum(1 for w in q_words if len(w) > 3 and w in text)
            score = matches / max(len(q_words), 1)
            
        scored_proposals.append((score, prop))
        
    scored_proposals.sort(key=lambda x: x[0], reverse=True)
    top_candidates = [p for _, p in scored_proposals[:6]] if scored_proposals else []
    
    # Build citations list
    citations: List[CitationItem] = []
    evidence_blocks = []
    
    for p in top_candidates:
        cit = CitationItem(
            partito=p.partito,
            macro_argomento=p.macro_argomento,
            sintesi=p.dichiarazione_sintesi,
            fonte_titolo=p.fonte_titolo,
            fonte_testata=p.fonte_testata,
            fonte_url=p.fonte_url,
            timestamp=p.timestamp.strftime("%d/%m/%Y"),
            fact_check_status=p.fact_check_status
        )
        citations.append(cit)
        
        block = f"""- PARTITO: {p.partito} ({p.macro_argomento})
  Sintesi: {p.dichiarazione_sintesi}
  Tipo Azione: {p.tipo_azione}
  Costo Stimato: {p.costo_stimato} | Coperture: {p.coperture_dichiarate}
  Fattibilità di Bilancio: {p.fattibilita_finanziaria}
  Status Fact-Check: {p.fact_check_status} (Motivazione: {p.fact_check_motivazione} - Fonte: {p.fact_check_fonte})
  Fonte Primaria: {p.fonte_testata or 'Atti'} ({p.fonte_url}) - Data: {p.timestamp.strftime('%d/%m/%Y')}"""
        evidence_blocks.append(block)

    evidence_text = "\n\n".join(evidence_blocks) if evidence_blocks else "Nessuna proposta specifica trovata nei parametri indicati."
    
    answer_text = ""
    disclaimer = "PolitiLens adotta rigorosa neutralità algoritmica. Le sintesi e i controlli di fattibilità si basano su dati ufficiali ISTAT, MEF e Corte dei Conti."

    # If Ollama is available, use local model
    if await ollama_client.is_available() and top_candidates:
        user_prompt = f"""DOMANDA UTENTE: "{req.question}"
MODALITÀ RICHIESTA: {req.mode}

DATI EVIDENZIATI DAL MONITORAGGIO POLITILENS:
{evidence_text}

Istruzioni per la risposta:
Rispondi in modo enciclopedico, bilanciato e neutrale in lingua italiana.
Organizza la risposta esponendo distintamente le posizioni dei vari partiti coinvolti, citando per ciascuno i costi stimati, le coperture previste e la valutazione oggettiva di fattibilità della Corte dei Conti / ISTAT. Non prendere alcuna parte politica."""

        messages = [
            {"role": "system", "content": RAG_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
        
        generated = await ollama_client.generate_chat(
            messages=messages,
            model=settings.OLLAMA_CHAT_MODEL,
            temperature=0.2
        )
        if generated:
            answer_text = generated

    # Fallback to rich structured synthesis if Ollama is not running
    if not answer_text:
        if not top_candidates:
            answer_text = "Non sono state trovate proposte corrispondenti ai criteri di ricerca indicati. Prova a formulare la domanda specificando un tema chiave (es. 'Salario Minimo', 'Nucleare', 'Sanità', 'Flat Tax') o un partito (es. 'PD', 'Fratelli d'Italia', 'M5S')."
        else:
            answer_text = f"### Quadro Comparativo PolitiLens\n\nIn relazione al tema **'{req.question}'**, ecco la sintesi neutrale delle posizioni registrate e verificate:\n\n"
            for p in top_candidates:
                answer_text += f"#### 🏛️ **{p.partito}** ({p.macro_argomento})\n"
                answer_text += f"- **Posizione / Proposta:** {p.dichiarazione_sintesi}\n"
                answer_text += f"- **Tipo di Atto:** `{p.tipo_azione}`\n"
                answer_text += f"- **Quadro Finanziario:** Costo stimato `{p.costo_stimato}` | Coperture dichiarate: *{p.coperture_dichiarate}*\n"
                answer_text += f"- **Fattibilità di Bilancio:** {p.fattibilita_finanziaria}\n"
                answer_text += f"- **Fact-Check Istituzionale:** Status **`{p.fact_check_status}`** — {p.fact_check_motivazione} *(Fonte: [{p.fact_check_fonte or 'Riferimento Istituzionale'}]({p.fact_check_fonte or p.fonte_url}))*\n\n"

            answer_text += f"\n*Documentazione tracciata da fonti primarie e consultabile nei riferimenti sottostanti.*"

    return ChatQueryResponse(
        answer=answer_text,
        neutrality_disclaimer=disclaimer,
        mode=req.mode or "comparativo",
        citations=citations
    )
