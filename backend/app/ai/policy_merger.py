import json
import re
import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import PoliticalProposal
from app.schemas import ProposalExtractionSchema
from app.ai.embeddings import cosine_similarity

# Semantic & topic key phrase groups for high-confidence policy topic clustering
CORE_POLICY_TOPIC_GROUPS = [
    ["salario minimo", "9 euro", "9€", "retribuzione minima"],
    ["pignorament", "sovraindebitamento", "cartelle esattoriali", "esecuzioni immobiliari"],
    ["pension", "quota 41", "uscita a 64", "tfr a previdenza", "anticipo pensionistico"],
    ["cuneo fiscale", "decontribuzione neoassunti", "sgravi contributivi"],
    ["flat tax", "aliquota unica 15%"],
    ["irpef", "ceto medio", "scaglioni irpef", "no tax area"],
    ["ius scholae", "cittadinanza minori", "10 anni di scuola"],
    ["fondo sanitario", "liste d'attesa", "7.5% del pil", "ssn", "medici ospedalieri"],
    ["trasparenza prestazioni sanitarie", "tariffe sanitarie", "costi prestazioni"],
    ["nucleare", "smr", "reattori nucleari", "iv generazione"],
    ["rinnovabili", "comunità energetiche", "solare", "eolico", "10 gw"],
    ["patrimoniale", "grandi ricchezze", "next generation tax", "super ricchi"],
    ["affitti brevi", "locazioni turistiche", "partita iva terzo immobile"],
    ["separazione delle carriere", "sdoppiamento csm", "riforma giustizia"],
    ["autonomia differenziata", "lep", "livelli essenziali delle prestazioni"],
    ["cannabis", "eutanasia", "fine vita assistito", "testamento biologico"],
    ["armi a kiev", "aiuti a kiev", "spese militari", "difesa europea", "eurobond"],
    ["trivelle", "commissario trivelle", "idrocarburi nazionali", "estrazione gas"],
    ["carceri", "sovraffollamento carcerario", "numero chiuso carceri"],
    ["accise", "prelievo tabacchi", "giochi d'azzardo", "carburanti"],
    ["sindaco d'italia", "premierato", "elezione diretta presidente", "bicameralismo paritario"],
    ["disinformazione", "propaganda russa", "interferenze estere"],
    ["certificazione costi programmi", "upb programmi elettorali", "scheda tecnica proposte"],
    ["immigrazione", "residenza 15 anni", "test di integrazione", "tutela identità"],
    ["spending review", "taglio selettivo spesa", "contrattazione aziendale", "opt-out"],
    ["scala mobile", "indicizzazione salari", "nazionalizzazione energia", "esproprio alloggi"],
    ["sovranità monetaria", "uscita euro", "neutralità permanente", "uscita nato"],
    ["competenze statutarie alto adige", "autonomia bolzano", "intermodalità brennero"]
]

def find_matching_existing_proposal(
    db: Session,
    party_id: Optional[int],
    partito: str,
    macro_argomento: str,
    dichiarazione_sintesi: str,
    emb_list: Optional[List[float]] = None
) -> Optional[PoliticalProposal]:
    """
    Autonomous AI Policy Deduplicator:
    Checks if a political party already has an existing proposal or stance on the same policy topic.
    Matches via:
    1. Core policy cluster keywords
    2. High-confidence semantic cosine similarity (>= 0.72) within the party and topic
    """
    query = db.query(PoliticalProposal).filter(
        (PoliticalProposal.macro_argomento == macro_argomento)
    )
    if party_id:
        query = query.filter((PoliticalProposal.party_id == party_id) | (PoliticalProposal.partito == partito))
    else:
        query = query.filter(PoliticalProposal.partito == partito)

    candidates = query.all()
    if not candidates:
        return None

    new_lower = dichiarazione_sintesi.lower()

    # 1. Match by Core Policy Topic Clusters
    for cand in candidates:
        cand_lower = cand.dichiarazione_sintesi.lower()
        for cluster in CORE_POLICY_TOPIC_GROUPS:
            new_has_cluster = any(term in new_lower for term in cluster)
            cand_has_cluster = any(term in cand_lower for term in cluster)
            if new_has_cluster and cand_has_cluster:
                return cand

    # 2. Match by Vector Embedding Cosine Similarity
    if emb_list:
        best_candidate = None
        best_sim = 0.0
        for cand in candidates:
            if cand.embedding:
                try:
                    cand_vec = json.loads(cand.embedding)
                    sim = cosine_similarity(emb_list, cand_vec)
                    if sim > best_sim:
                        best_sim = sim
                        best_candidate = cand
                except Exception:
                    continue

        if best_candidate and best_sim >= 0.72:
            return best_candidate

    return None

def merge_or_update_policy_proposal(
    db: Session,
    existing: PoliticalProposal,
    item: ProposalExtractionSchema,
    url: str,
    title: Optional[str],
    source_name: Optional[str],
    published_at: Optional[datetime.datetime],
    raw_text: Optional[str],
    content_hash: Optional[str],
    emb_json: Optional[str]
) -> PoliticalProposal:
    """
    Autonomous AI Policy Merger & Evolver:
    Updates an existing proposal with the latest, most up-to-date position, costs, and fact-check data.
    Ensures that policy updates reflect the party's most recent stance without creating duplicates.
    """
    dt = datetime.datetime.fromisoformat(item.timestamp) if item.timestamp else (published_at or datetime.datetime.utcnow())

    # Update statement with latest formulation
    existing.dichiarazione_sintesi = item.dichiarazione_sintesi

    if item.tipo_azione:
        existing.tipo_azione = item.tipo_azione

    # Update economic quantification if newer data provides real numbers
    if item.impatto_economico.costo_stimato and item.impatto_economico.costo_stimato != "Non quantificato":
        existing.costo_stimato = item.impatto_economico.costo_stimato

    if item.impatto_economico.coperture_dichiarate and item.impatto_economico.coperture_dichiarate != "Non specificate":
        existing.coperture_dichiarate = item.impatto_economico.coperture_dichiarate

    if item.impatto_economico.fattibilita_finanziaria:
        existing.fattibilita_finanziaria = item.impatto_economico.fattibilita_finanziaria

    # Update fact-check verification
    if item.fact_check.status:
        existing.fact_check_status = item.fact_check.status

    if item.fact_check.motivazione_oggettiva:
        existing.fact_check_motivazione = item.fact_check.motivazione_oggettiva

    if item.fact_check.fonte_verifica:
        existing.fact_check_fonte = item.fact_check.fonte_verifica

    # Update tracking metadata and newer timestamp
    existing.fonte_url = item.fonte_url or url
    if title:
        existing.fonte_titolo = title
    if source_name:
        existing.fonte_testata = source_name
    if raw_text:
        existing.raw_text = raw_text
    if content_hash:
        existing.content_hash = content_hash
    if emb_json:
        existing.embedding = emb_json

    existing.timestamp = dt

    return existing
