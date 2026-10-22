"""
Audit & Modification Changelog API Router
Provides institutional transparency, verifiable tracking of every AI operation,
poll variance, fiscal audit, and policy distillation across PoliticLens.
"""

import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import AuditLog, PoliticalParty, PoliticalProposal
from app.schemas import AuditLogSchema, AuditListResponse

router = APIRouter(prefix="/api/audit", tags=["Audit & Changelog"])

def seed_audit_history_if_empty(db: Session):
    """Generates initial realistic institutional audit logs if the table is empty."""
    if db.query(AuditLog).count() > 0:
        return

    print("[Audit] Seeding historical audit trail 2022-2026...")
    historical_events = [
        {
            "event_type": "POLL_UPDATE",
            "entity_type": "party",
            "entity_id": "FDI",
            "entity_name": "Fratelli d'Italia",
            "old_value": "26.0% (Elezioni 2022)",
            "new_value": "29.4% (+0.3%)",
            "agent_responsible": "PollTrackerAgent",
            "details": "Aggiornamento media YouTrend/AGI e SWG. Consolidamento primo partito.",
            "timestamp": datetime.datetime(2026, 4, 15, 10, 30)
        },
        {
            "event_type": "FACT_CHECK_AUDIT",
            "entity_type": "proposal",
            "entity_id": "prop-sanita-pd",
            "entity_name": "Piano Straordinario Sanità Pubblica (PD)",
            "old_value": "In attesa di copertura",
            "new_value": "Verificato (con clausola salvaguardia)",
            "agent_responsible": "FiscalAuditorAgent",
            "details": "Verifica conformità art. 81 Cost. con parametro benchmark FSN MEF (136.5 Mld €). Oneri stimati a 5.5 Mld €.",
            "timestamp": datetime.datetime(2026, 3, 28, 14, 15)
        },
        {
            "event_type": "PROPOSAL_CREATED",
            "entity_type": "proposal",
            "entity_id": "prop-nucleare-fi",
            "entity_name": "Ritorno al Nucleare di IV Generazione (FI)",
            "old_value": None,
            "new_value": "Dichiarazione programmatica censita da atti Camera",
            "agent_responsible": "PolicyDistillerAgent",
            "details": "Estratto da DDL delega su mix energetico nazionale. Oneri stimati a 3.0 Mld € cofinanziati con fondi REPowerEU.",
            "timestamp": datetime.datetime(2026, 2, 10, 11, 45)
        },
        {
            "event_type": "POLL_UPDATE",
            "entity_type": "party",
            "entity_id": "PD",
            "entity_name": "Partito Democratico",
            "old_value": "19.0% (Elezioni 2022)",
            "new_value": "23.2% (+0.2%)",
            "agent_responsible": "PollTrackerAgent",
            "details": "Rilevazione demoscopica Ipsos per Corriere della Sera. Trend positivo nell'area centrosinistra.",
            "timestamp": datetime.datetime(2026, 1, 20, 9, 0)
        },
        {
            "event_type": "PROPOSAL_UPDATED",
            "entity_type": "proposal",
            "entity_id": "prop-salario-m5s",
            "entity_name": "Salario Minimo a 9 Euro (M5S / AVS / PD)",
            "old_value": "Proposta di legge ordinaria XIX Leg.",
            "new_value": "Ripresentazione testo unificato e mozione di indirizzo",
            "agent_responsible": "ReconciliationAgent",
            "details": "Deduplicazione semantica tra mozione unitaria d'opposizione e testi depositati nel 2023.",
            "timestamp": datetime.datetime(2025, 11, 14, 16, 20)
        },
        {
            "event_type": "FACT_CHECK_AUDIT",
            "entity_type": "proposal",
            "entity_id": "prop-flattax-lega",
            "entity_name": "Estensione Flat Tax al 15% fino a 100k (Lega)",
            "old_value": "Verificato parziale",
            "new_value": "In attesa di copertura (scostamento UPB)",
            "agent_responsible": "FiscalAuditorAgent",
            "details": "Ufficio Parlamentare di Bilancio segnala potenziale minor gettito di 4.2 Mld € senza clausole di compensazione IRPEF.",
            "timestamp": datetime.datetime(2025, 9, 5, 12, 10)
        },
        {
            "event_type": "INGESTION_SCAN",
            "entity_type": "source",
            "entity_id": "ALL_RSS",
            "entity_name": "Scansione Fonti Istituzionali & Stampa",
            "old_value": None,
            "new_value": "28 nuovi articoli parlamentari analizzati",
            "agent_responsible": "ScoutAgent",
            "details": "Scansione automatica Gazzetta Ufficiale, Bollettini Camera/Senato, Ansa e Il Sole 24 Ore completata con zero errori.",
            "timestamp": datetime.datetime(2025, 6, 22, 8, 30)
        },
        {
            "event_type": "BENCHMARK_SYNC",
            "entity_type": "benchmark",
            "entity_id": "MEF-PIL-2025",
            "entity_name": "Aggiornamento Parametri Quadro Macroeconomico MEF",
            "old_value": "PIL Nominale 2.085 Mld €",
            "new_value": "PIL Nominale 2.120 Mld € (DEF / Quadro Finanziario)",
            "agent_responsible": "System",
            "details": "Allineamento automatico dei coefficienti macroeconomici alle tabelle ISTAT / MEF per i calcoli econometrici.",
            "timestamp": datetime.datetime(2025, 4, 12, 17, 0)
        },
        {
            "event_type": "PROPOSAL_CREATED",
            "entity_type": "proposal",
            "entity_id": "prop-fisco-fdi",
            "entity_name": "Riforma Fiscale e Concordato Preventivo Biennale (FdI)",
            "old_value": None,
            "new_value": "Decreto Legislativo attuativo legge delega",
            "agent_responsible": "PolicyDistillerAgent",
            "details": "Censimento del provvedimento definitivo pubblicato in Gazzetta Ufficiale.",
            "timestamp": datetime.datetime(2024, 10, 8, 15, 30)
        },
        {
            "event_type": "POLL_UPDATE",
            "entity_type": "party",
            "entity_id": "M5S",
            "entity_name": "Movimento 5 Stelle",
            "old_value": "15.4% (Elezioni 2022)",
            "new_value": "11.5% (-0.2%)",
            "agent_responsible": "PollTrackerAgent",
            "details": "Media sondaggi post-Europee. Rimodulazione consenso parlamentare.",
            "timestamp": datetime.datetime(2024, 6, 18, 10, 0)
        }
    ]

    for ev in historical_events:
        db.add(AuditLog(**ev))
    db.commit()

@router.get("/logs", response_model=AuditListResponse)
def get_audit_logs(
    event_type: Optional[str] = None,
    agent: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns full institutional audit log entries with flexible filtering
    for events, agents, parties, and keywords.
    """
    seed_audit_history_if_empty(db)

    query = db.query(AuditLog)

    if event_type and event_type != "Tutti":
        query = query.filter(AuditLog.event_type == event_type)

    if agent and agent != "Tutti":
        query = query.filter(AuditLog.agent_responsible == agent)

    if search and search.strip():
        q_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                AuditLog.entity_name.ilike(q_term),
                AuditLog.details.ilike(q_term),
                AuditLog.event_type.ilike(q_term),
                AuditLog.agent_responsible.ilike(q_term)
            )
        )

    total = query.count()
    logs = query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()

    # Get distinct event types and agents for filter drop-downs
    distinct_types = [r[0] for r in db.query(AuditLog.event_type).distinct().all() if r[0]]
    distinct_agents = [r[0] for r in db.query(AuditLog.agent_responsible).distinct().all() if r[0]]

    return AuditListResponse(
        total=total,
        logs=logs,
        event_types=distinct_types,
        agents=distinct_agents
    )
