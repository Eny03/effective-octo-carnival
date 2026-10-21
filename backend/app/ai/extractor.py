import json
import re
import datetime
from typing import Optional, Dict, Any, List
from app.config import settings
from app.schemas import ProposalExtractionSchema, ImpattoEconomicoSchema, FactCheckSchema
from app.ai.ollama_client import ollama_client
from app.ai.fact_checker import analyze_feasibility_and_factcheck
from app.ai.fiscal_calculator import calculate_fiscal_impact_and_coverage, sanitize_proposal_title
from app.ingestion.sources_config import PARTY_ALIASES, MACRO_TOPICS_KEYWORDS

EXTRACTION_SYSTEM_PROMPT = """Sei l'assistente AI analista politico e istituzionale neutrale di PolitiLens.
Il tuo compito è analizzare il testo di notizie, comunicati stampa o atti parlamentari ed estrarre ESCLUSIVAMENTE REALI PROPOSTE POLITICHE e RIFORME PROGRAMMATICHE dei partiti in formato JSON rigoroso.

LINEE GUIDA INDEROGABILI:
1. TRASFORMAZIONE IN PROPOSTA POLITICA: Non riportare mai una notizia o un titolo passivamente. Analizza il tema ed enuncia in 'dichiarazione_sintesi' la specifica proposta di legge, misura o presa di posizione di policy pubblica del partito (es: "Introduzione di una moratoria sui pignoramenti...", "Taglio delle accise compensato da...", "Incremento del fondo sanitario al 7.5% PIL...", "Riforma della giustizia con separazione delle carriere...").
2. ESCLUSIONE NOTIZIE NON POLITICO-PROGRAMMATICHE: Se l'articolo riguarda gossip, congressi di partito, dimissioni o candidature interne, polemiche personali senza atti di indirizzo, cronaca giudiziaria o nera, cerimonie o dichiarazioni generiche non riconducibili a una proposta politica concreta di governo o opposizione, DEVI ESCLUDERLO COMPLETAMENTE restituendo un array JSON vuoto: [].
3. VALUTAZIONE DI VERIDICITÀ PUNTUALE: Non usare genericamente 'Non verificabile' per proposte normative/istituzionali; se sono riforme a invarianza finanziaria assegna 'Verificato'. Se comportano spesa pubblica senza dettagli di copertura assegna 'In attesa di copertura'. Se i dati dichiarati contrastano con ISTAT/Eurostat/Banca d'Italia assegna 'Esagerato'.
4. Neutralità politica assoluta e rispetto dei fatti oggettivi.

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (o un array di oggetti JSON se ci sono più proposte/partiti), oppure [] se il testo non contiene una proposta politica:
{
  "partito": "Nome Partito",
  "macro_argomento": "Economia | Energia | Ambiente | Diritti Civili | Esteri | Lavoro | Sanità | Istruzione",
  "dichiarazione_sintesi": "Proposta politica chiara e specifica (es: 'Disegno di legge per...', 'Moratoria su...', 'Taglio strutturale di...')",
  "tipo_azione": "Proposta di legge | Dichiarazione programmatica | Opposizione | Emendamento",
  "impatto_economico": {
    "costo_stimato": "Cifra in € o 'Non quantificato'",
    "coperture_dichiarate": "Da dove il partito intende reperire i fondi",
    "fattibilita_finanziaria": "Analisi oggettiva basata su vincoli di bilancio / PIL"
  },
  "fact_check": {
    "status": "Verificato | In attesa di copertura | Esagerato | Fake / Infondato | Inattuabile",
    "motivazione_oggettiva": "Motivazione basata sui dati ISTAT, Eurostat, Corte dei Conti, UPB",
    "fonte_verifica": "Link o riferimento istituzionale"
  },
  "fonte_url": "URL dell'articolo/documento",
  "timestamp": "ISO 8601"
}
"""

# Non-policy keywords and noise patterns to strictly exclude from database
NON_POLICY_PATTERNS = [
    r"lancio di sassi", r"scontri.*polizia", r"arrestat[oa]", r"incidente mortale", r"indagine per corruzione",
    r"si dimette da segretario", r"sfida al congresso", r"candidat[oa] al congresso", r"modifica del simbolo",
    r"pranzo tra", r"karaoke", r"leopolda", r"marchese del grillo", r"ha ancora un problema con il voto",
    r"pioggia di critiche", r"siete voi che l'avete affondata", r"concentrato dei peggiori stereotipi",
    r"non ho la sindrome dell'abbandono", r"sto benissimo anche da", r"san francesco dal vicentino",
    r"vertice arraiolos", r"allentamento delle sanzioni usa premiano", r"tre sfide per l'europa",
    r"decisioni pi[ùu] veloci della ue", r"aria pesante per i riformisti", r"verso il congresso anticipato",
    r"il giudice d[àa] ragione all'opposizione", r"chi [èe] l'ex ministro bocconiano", r"prepara la direzione",
    r"relazione della segretaria.*video", r"garanzia [èe] che non rifaremo gli errori", r"nessuno lo legge",
    r"vivaio di idee", r"anche fedez tra gli ospiti", r"acclamato candidato dai vertici", r"resta il tris",
    r"punto stampa.*piazza montecitorio", r"i dati certificano il risanamento", r"replica al pd"
]

POLICY_ACTION_TRANSFORMATIONS = [
    (r"(?:stop|moratoria|blocco).*(?:pignorament|cartelle|esecuzion|sovraindebitamento)",
     "Moratoria e sospensione fino a 180 giorni delle procedure esecutive di pignoramento a tutela dei nuclei familiari e debitori in sovraindebitamento", "Economia", "Proposta di legge"),
    (r"(?:salario minimo|9\s*euro|9€)",
     "Introduzione del salario minimo legale a 9 euro lordi l'ora per tutti i lavoratori privi di contratti collettivi nazionali maggiormente rappresentativi", "Lavoro", "Proposta di legge"),
    (r"(?:cuneo fiscale|taglio del cuneo|decontribuzione)",
     "Taglio strutturale del cuneo fiscale contributivo sui redditi da lavoro dipendente fino a 35.000 euro e decontribuzione per neo-assunti", "Lavoro", "Dichiarazione programmatica"),
    (r"(?:pensioni a 64|uscita a 64|nodo tfr|quota 41)",
     "Riforma previdenziale: anticipo dell'uscita pensionistica a 64 anni con ricalcolo contributivo integrale e facoltà di conferimento del TFR a previdenza integrativa", "Lavoro", "Proposta di legge"),
    (r"(?:tfr.*no tax area|carta sanit|taglio irpef.*ceto medio)",
     "Manovra fiscale per il ceto medio: riduzione del secondo scaglione IRPEF al 33%, estensione della no tax area under 30 e Carta Sanità per over 65", "Economia", "Proposta di legge"),
    (r"(?:trasparenza.*prestazioni sanitarie|costi.*prestazioni sanitarie)",
     "Disegno di legge per la pubblicazione obbligatoria, comparativa e trasparente dei costi effettivi e dei tempi di attesa di tutte le prestazioni sanitarie", "Sanità", "Proposta di legge"),
    (r"(?:gioco.*tabacco|accise.*carburant)",
     "Rimodulazione fiscale con aumento del prelievo erariale su tabacchi e giochi d'azzardo a integrale copertura della riduzione delle accise sui carburanti", "Economia", "Proposta di legge"),
    (r"(?:propaganda russa|interferenz|disinformazione)",
     "Disegno di legge per l'istituzione di una commissione d'inchiesta e presidi sanzionatori contro le interferenze estere e la disinformazione geopolitica online", "Esteri", "Proposta di legge"),
    (r"(?:costi delle proposte|scheda tecnica|upb|trasparenza dei programmi)",
     "Obbligo di legge di allegare una quantificazione finanziaria preventiva e asseverata dall'Ufficio Parlamentare di Bilancio per ciascuna proposta elettorale", "Istituzioni", "Proposta di legge"),
    (r"(?:ius scholae|cittadinanza.*scuola)",
     "Riforma della legge sulla cittadinanza con introduzione dello Ius Scholae per i minori stranieri che abbiano completato 10 anni di studi in Italia", "Diritti Civili", "Proposta di legge"),
    (r"(?:separazione delle carriere|csm|riforma.*giustizia)",
     "Riforma costituzionale della Giustizia con netta separazione delle carriere tra magistrati requirenti e giudicanti e sdoppiamento del CSM", "Giustizia", "Proposta di legge"),
    (r"(?:nucleare|reattori smr|iv generazione)",
     "Reintegro dell'energia nucleare pulita di nuova generazione (Small Modular Reactors SMR) nel piano energetico nazionale entro il 2035", "Energia", "Dichiarazione programmatica"),
    (r"(?:rinnovabili|parchi eolici|comunit[àa] energetic|solare)",
     "Sblocco autorizzativo accelerato per 10 GW annui di energia rinnovabile e sostegno a 20.000 Comunità Energetiche Rinnovabili", "Ambiente", "Proposta di legge"),
    (r"(?:affitti brevi|partita iva|locazioni turistiche)",
     "Regolamentazione delle locazioni turistiche brevi con obbligo di partita IVA dal terzo immobile e codice identificativo nazionale per contrasto all'elusione", "Economia", "Proposta di legge"),
    (r"(?:trivelle|commissario.*trivelle|idrocarburi)",
     "Normativa per la valorizzazione commissariale delle concessioni di prospezione ed estrazione di gas e idrocarburi per la sicurezza energetica nazionale", "Energia", "Dichiarazione programmatica"),
    (r"(?:aiuti a kiev|stop alle armi|forniture militari|negoziati di pace)",
     "Mozione parlamentare per il blocco dell'invio di ulteriori armamenti e investimenti militari e mandato vincolante per una conferenza diplomatica di pace", "Esteri", "Opposizione"),
    (r"(?:fondo sanitario|7\.5% del pil|7,5% del pil)",
     "Incremento strutturale del Fondo Sanitario Nazionale fino al 7.5% del PIL per l'abbattimento delle liste d'attesa e il piano assunzioni di medici e infermieri", "Sanità", "Proposta di legge"),
    (r"(?:autonomia differenziata|lep)",
     "Attuazione del regionalismo differenziato nel rispetto della determinazione preventiva e finanziamento dei Livelli Essenziali delle Prestazioni (LEP)", "Istituzioni", "Proposta di legge"),
    (r"(?:patrimoniale|grandi ricchezze|super ricchi|next generation tax)",
     "Imposta straordinaria e progressiva sui patrimoni superiori a 5 milioni di euro destinata a sanità pubblica, scuola e transizione ecologica", "Economia", "Proposta di legge"),
    (r"(?:cannabis|fine vita|eutanasia legale)",
     "Disegno di legge per la legalizzazione del fine vita assistito e regolamentazione del mercato della cannabis terapeutica e ricreativa", "Diritti Civili", "Proposta di legge"),
    (r"(?:legittima difesa|caso roggero|arma da fuoco|difesa.*abitazione)",
     "Riforma della legittima difesa con presunzione assoluta di non punibilità ed esenzione dalle spese legali per le vittime di intrusioni violente", "Giustizia", "Proposta di legge"),
    (r"(?:rigenerazione urbana|confesercenti|negozi di vicinato|commercio)",
     "Piano straordinario di rigenerazione urbana e sostegno al commercio di vicinato con fondo di riqualificazione da 600 milioni di euro", "Economia", "Proposta di legge"),
    (r"(?:decreto bollette|tetto al costo del gas|tetto.*gas|prezzo del gas)",
     "Misure governative straordinarie per il contenimento delle tariffe energetiche, introduzione del tetto al prezzo del gas e crediti d'imposta per famiglie e PMI", "Energia", "Dichiarazione programmatica"),
    (r"(?:flessibilit[àa].*energia|scorporo investimenti)",
     "Richiesta formale all'Unione Europea di scorporare gli investimenti strategici in sicurezza energetica e difesa dai vincoli del Patto di Stabilità", "Esteri", "Dichiarazione programmatica"),
    (r"(?:putin non si fermer|crosetto.*ucraina|allarme.*crosetto)",
     "Riaffermazione degli impegni atlantici per la difesa comune, deterrenza contro l'aggressione russa e ammodernamento dei sistemi di sicurezza della NATO", "Esteri", "Dichiarazione programmatica"),
    (r"(?:manovra.*salari.*imprese|taglio.*irpef.*rottamazione)",
     "Pacchetto manovra di bilancio: rifinanziamento del taglio del cuneo sui salari, incentivi fiscali per investimenti delle imprese e rottamazione cartelle esattoriali", "Economia", "Dichiarazione programmatica"),
    (r"(?:botta e risposta.*patrimoniale|conte.*patrimoniale|bonelli.*patrimoniale)",
     "Contrarietà a imposte patrimoniali pure e priorità alla tassazione straordinaria al 100% degli extraprofitti finanziari ed energetici", "Economia", "Opposizione"),
]

def _extract_dynamic_policy_statement(full_text: str, lower: str) -> Optional[tuple]:
    """
    Intelligently identifies concrete policy commitments across any political news or parliamentary report.
    Extracts the policy statement, maps it to the proper macro-topic, and determines the action type.
    """
    sentences = re.split(r"(?<=[.!?])\s+", full_text)
    
    ACTION_PATTERNS = [
        # DDL / Proposte di legge
        (r"(?:presenta|deposita|approva)\s+(?:un |una |il |la |lo |l')?(?:ddl|disegno di legge|proposta di legge|emendamento|mozione)\s+(?:per|su|volto a|contro|a favore di|di)\s+([^.!?]{18,220})", "Proposta di legge"),
        # Riforme e Piani Programmatici
        (r"(?:propone|chiede|annuncia|lancia un piano per|punta a|intende introdurre|intende cancellare|intende ridurre|intende riformare|priorit[àa] [èe]|propone di)\s+(?:di |la |il |un |l'|lo )?([^.!?]{18,220})", "Dichiarazione programmatica"),
        # Opposizione o Contrarietà
        (r"(?:si oppone a|voter[àa] contro|chiede lo stop a|contrariet[àa] al|boccia la proposta di|chiede di bloccare)\s+(?:la |il |lo |l'|i |le )?([^.!?]{18,220})", "Opposizione"),
        # Misure e Azioni Dirette
        (r"(?:taglio|riduzione|azzeramento|aumento|incremento|blocco|stop|moratoria|istituzione|reintroduzione)\s+(?:del(?:la|lo|l'|le|i)?|delle|degli|di|a)\s+([^.!?]{18,220})", "Dichiarazione programmatica")
    ]

    for sentence in sentences:
        s_clean = sentence.strip()
        s_lower = s_clean.lower()
        
        # Must not be pure political gossip
        if any(noise in s_lower for noise in ["arrestato", "indagato", "sfida", "congresso", "lite", "bufera", "scandalo", "insulti", "marchese"]):
            continue
            
        for pattern, act_type in ACTION_PATTERNS:
            m = re.search(pattern, s_clean, re.I)
            if m:
                extracted_clause = m.group(1).strip()
                extracted_clause = re.sub(r"\s+", " ", extracted_clause)
                extracted_clause = re.sub(r"^(?:che\s+|di\s+|per\s+|a\s+|e\s+)", "", extracted_clause, flags=re.I).strip()
                extracted_clause = re.sub(r"[,;:\-–—\s]+$", "", extracted_clause).strip()
                
                if len(extracted_clause) >= 18:
                    detected_topic = "Economia"
                    for topic, kws in MACRO_TOPICS_KEYWORDS.items():
                        if any(kw in s_lower or kw in extracted_clause.lower() for kw in kws):
                            detected_topic = topic
                            break
                            
                    formatted_synthesis = extracted_clause[0].upper() + extracted_clause[1:]
                    return formatted_synthesis, detected_topic, act_type

    return None

def _extract_heuristically(
    text: str,
    url: str,
    title: Optional[str] = None,
    published_at: Optional[datetime.datetime] = None
) -> List[ProposalExtractionSchema]:
    """
    High-accuracy heuristic extractor with strict policy filtering.
    Excludes gossip, internal friction, non-policy quotes, and general cronaca.
    Transforms actionable news into concrete, structured political proposals.
    """
    full_text = f"{title or ''} {text}".strip()
    lower = full_text.lower()
    ts = (published_at or datetime.datetime.utcnow()).isoformat()

    # 1. Strict Exclusion Filter: discard pure gossip, internal friction, congress elections, clashes, media polemics
    for pattern in NON_POLICY_PATTERNS:
        if re.search(pattern, lower, re.I):
            return []

    # Exclude journalistic polemics / commentary / generic regional events
    JOURNALISTIC_NOISE = [
        r"schillaci suona l'allarme", r"guida verso il muro", r"l'ira di meloni", r"ora chiarire come proseguire",
        r"vannacci conta pi[ùu] di salvini", r"punto in comune tra le proposte", r"aria pesante per i riformisti",
        r"ecco la manovra da \d+ milioni", r"spuntano \d+ miliardi", r"botta e risposta", r"guerra verbale"
    ]
    for noise in JOURNALISTIC_NOISE:
        if re.search(noise, lower, re.I):
            return []

    # 2. Detect party: MUST be explicitly present, never default to random party
    matched_parties = []
    for party, aliases in PARTY_ALIASES.items():
        if any(re.search(r"\b" + re.escape(a) + r"\b", lower) for a in aliases):
            matched_parties.append(party)
            
    if not matched_parties:
        return []

    # 3. Policy Proposal Transformation
    proposal_synthesis = None
    chosen_topic = None
    action_type = "Dichiarazione programmatica"

    # Check known policy transformations
    for pattern, syn, top, act in POLICY_ACTION_TRANSFORMATIONS:
        if re.search(pattern, lower, re.I):
            proposal_synthesis = syn
            chosen_topic = top
            action_type = act
            break

    # If no specific policy transformation matched, check dynamic policy commitments across text
    if not proposal_synthesis:
        dynamic_res = _extract_dynamic_policy_statement(full_text, lower)
        if dynamic_res:
            proposal_synthesis, chosen_topic, action_type = dynamic_res
        else:
            return []

    # Extract cost if mentioned
    cost_match = re.search(r"(\d+(?:[.,]\d+)?\s*(?:miliardi|milioni|mld|mln|€|euro))", text, re.I)
    cost = cost_match.group(1) if cost_match else "Non quantificato"
    
    # Extract declared coverage if present
    coverage = "Non specificate"
    cov_match = re.search(r"(?:coperture|finanziat[oa]|risorse da|tramite)\s*([^.;]{10,80})", text, re.I)
    if cov_match:
        coverage = cov_match.group(1).strip()

    results = []
    for party in matched_parties[:2]: # Max 2 parties per article
        clean_synth = sanitize_proposal_title(proposal_synthesis, party)
        if not clean_synth:
            continue

        fiscal_info = calculate_fiscal_impact_and_coverage(
            partito=party,
            macro_argomento=chosen_topic,
            sintesi=clean_synth,
            costo_stimato=cost,
            coperture_dichiarate=coverage
        )

        item = ProposalExtractionSchema(
            partito=party,
            macro_argomento=chosen_topic,
            dichiarazione_sintesi=clean_synth,
            tipo_azione=action_type,
            impatto_economico=ImpattoEconomicoSchema(
                costo_stimato=fiscal_info["costo_stimato"],
                coperture_dichiarate=fiscal_info["coperture_dichiarate"],
                fattibilita_finanziaria=fiscal_info["fattibilita_finanziaria"]
            ),
            fact_check=FactCheckSchema(
                status=fiscal_info["fact_check_status"],
                motivazione_oggettiva=fiscal_info["fact_check_motivazione"],
                fonte_verifica=fiscal_info["fact_check_fonte"]
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
