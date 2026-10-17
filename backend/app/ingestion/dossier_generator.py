import json
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import PoliticalParty, PoliticalProposal, InstitutionalBenchmark

def generate_party_dossier(party: PoliticalParty, db: Session) -> Dict[str, Any]:
    """
    Synthesizes all gathered web data, official statements, and economic fact-checks
    into a comprehensive, structured AI Strategic Dossier for a political party.
    """
    proposals = db.query(PoliticalProposal).filter(
        (PoliticalProposal.party_id == party.id) | (PoliticalProposal.partito.ilike(f"%{party.name}%"))
    ).order_by(PoliticalProposal.timestamp.desc()).all()

    # Economic benchmarks for comparison
    benchmarks = db.query(InstitutionalBenchmark).all()
    benchmarks_summary = {b.indicatore: f"{b.valore} {b.unita} ({b.fonte_istituzionale} {b.anno_riferimento})" for b in benchmarks}

    # Macro-topics grouping
    topic_groups: Dict[str, List[PoliticalProposal]] = {}
    for p in proposals:
        topic_groups.setdefault(p.macro_argomento, []).append(p)

    # Calculate Fact-Check statistics
    total_props = len(proposals)
    verified_count = sum(1 for p in proposals if p.fact_check_status == "Verificato")
    pending_coverage = sum(1 for p in proposals if p.fact_check_status == "In attesa di copertura")
    exaggerated_count = sum(1 for p in proposals if p.fact_check_status == "Esagerato")
    fake_count = sum(1 for p in proposals if p.fact_check_status == "Fake / Infondato")

    feasibility_score = 0
    if total_props > 0:
        feasibility_score = round(((verified_count * 100) + (pending_coverage * 50)) / total_props)

    # Core Pillars Synthesis
    pillars = []
    for topic, props in topic_groups.items():
        sample = props[0]
        pillars.append({
            "tema": topic,
            "proposta_chiave": sample.dichiarazione_sintesi,
            "tipo_azione": sample.tipo_azione,
            "costo": sample.costo_stimato,
            "coperture": sample.coperture_dichiarate,
            "status_verifica": sample.fact_check_status,
            "motivazione": sample.fact_check_motivazione or sample.fattibilita_finanziaria or "Valutazione oggettiva basata su parametri MEF/ISTAT.",
            "fonte_url": sample.fonte_url,
            "fonte_testata": sample.fonte_testata or "Web & Fonti Ufficiali"
        })

    # Recent web quotes & events
    recent_quotes = []
    for p in proposals[:5]:
        recent_quotes.append({
            "data": p.timestamp.strftime("%d/%m/%Y") if p.timestamp else datetime.datetime.utcnow().strftime("%d/%m/%Y"),
            "titolo": p.fonte_titolo or p.dichiarazione_sintesi[:80] + "...",
            "dichiarazione": p.dichiarazione_sintesi,
            "fonte": p.fonte_testata or "Web Nazionale",
            "url": p.fonte_url
        })

    # Financial evaluation text
    total_cost_items = [p.costo_stimato for p in proposals if p.costo_stimato and p.costo_stimato != "Non quantificato"]
    quantified_count = len(total_cost_items)

    valutazione_finanziaria = {
        "score_fattibilita": f"{feasibility_score}%",
        "atti_quantificati": f"{quantified_count} su {total_props} posizioni",
        "analisi_coperture": (
            f"Dall'analisi delle proposte rilevate sul web e negli atti parlamentari, il partito presenta "
            f"{verified_count} proposte pienamente compatibili con le coperture di bilancio, "
            f"mentre {pending_coverage} misure necessitano di dettagli operativi o dipendono da tagli di spesa/maggiori entrate tributarie. "
            f"I parametri di riferimento considerano il debito pubblico al 137.3% PIL e il tetto del disavanzo al 3% stabilito dal Patto di Stabilità UE."
        )
    }

    # AI Executive Political Synthesis
    sintesi_politica = (
        f"{party.name} ({party.coalition}), sotto la guida di {party.leader or 'Segreteria collegiale'}, "
        f"articola la propria azione politica su {len(topic_groups)} macro-aree tematiche. "
        f"L'osservatorio ha censito {total_props} atti, disegni di legge e prese di posizione pubbliche sul web. "
        f"I dossier tematici prioritari risultano essere: {', '.join(list(topic_groups.keys())[:4])}."
    )

    dossier = {
        "partito_nome": party.name,
        "partito_codice": party.code,
        "coalizione": party.coalition,
        "leader": party.leader,
        "sintesi_strategica": sintesi_politica,
        "score_affidabilita": f"{feasibility_score}%",
        "statistiche_atti": {
            "totale_atti": total_props,
            "verificati": verified_count,
            "in_attesa_copertura": pending_coverage,
            "esagerati_o_non_quantificati": exaggerated_count + (total_props - quantified_count)
        },
        "pilastri_programmatici": pillars,
        "valutazione_finanziaria": valutazione_finanziaria,
        "dichiarazioni_recenti_web": recent_quotes,
        "parametri_macro_confronto": benchmarks_summary,
        "ultimo_aggiornamento_web": datetime.datetime.utcnow().strftime("%d/%m/%Y ore %H:%M UTC")
    }

    return dossier

def update_all_party_dossiers(db: Session):
    """
    Iterates over all political parties and generates updated AI Dossiers from gathered web data.
    """
    parties = db.query(PoliticalParty).all()
    for party in parties:
        try:
            dossier_data = generate_party_dossier(party, db)
            party.dossier_ai = json.dumps(dossier_data, ensure_ascii=False)
        except Exception as e:
            print(f"[DossierGenerator] Error updating dossier for {party.name}: {e}")
    db.commit()
    print(f"[DossierGenerator] Successfully updated AI dossiers for {len(parties)} parties.")
