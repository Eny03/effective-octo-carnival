from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import PoliticalProposal, PoliticalParty, InstitutionalBenchmark, IngestionLog
from app.schemas import StatsOverviewResponse, InstitutionalBenchmarkSchema
from app.ingestion.sources_config import MONITORED_FEEDS

router = APIRouter(prefix="/api/stats", tags=["Statistiche & Indicatori Istituzionali"])

@router.get("/benchmarks", response_model=List[InstitutionalBenchmarkSchema])
def get_benchmarks(db: Session = Depends(get_db)):
    """Returns official institutional economic benchmarks (ISTAT, Eurostat, Corte dei Conti)."""
    return db.query(InstitutionalBenchmark).order_by(InstitutionalBenchmark.categoria).all()

@router.get("/overview", response_model=StatsOverviewResponse)
def get_overview_stats(db: Session = Depends(get_db)):
    """
    Returns high-level analytical metrics:
    - Topic breakdown
    - Party distribution
    - Fact-check status breakdown
    - Cost quantification index (% of proposals with real monetary estimation)
    """
    total_proposals = db.query(func.count(PoliticalProposal.id)).scalar() or 0
    total_parties = db.query(func.count(PoliticalParty.id)).scalar() or 0
    total_sources = len(MONITORED_FEEDS)

    # Proposals by party
    party_counts_raw = db.query(PoliticalProposal.partito, func.count(PoliticalProposal.id)).group_by(PoliticalProposal.partito).all()
    proposals_by_party: Dict[str, int] = {item[0]: item[1] for item in party_counts_raw}

    # Proposals by topic
    topic_counts_raw = db.query(PoliticalProposal.macro_argomento, func.count(PoliticalProposal.id)).group_by(PoliticalProposal.macro_argomento).all()
    proposals_by_topic: Dict[str, int] = {item[0]: item[1] for item in topic_counts_raw}

    # Fact-check distribution
    fc_counts_raw = db.query(PoliticalProposal.fact_check_status, func.count(PoliticalProposal.id)).group_by(PoliticalProposal.fact_check_status).all()
    fact_check_distribution: Dict[str, int] = {item[0]: item[1] for item in fc_counts_raw}

    # Cost quantification percentage
    quantified_count = db.query(func.count(PoliticalProposal.id)).filter(
        PoliticalProposal.costo_stimato != "Non quantificato",
        PoliticalProposal.costo_stimato.isnot(None)
    ).scalar() or 0
    
    quantified_percentage = round((quantified_count / total_proposals * 100), 1) if total_proposals > 0 else 0.0

    # Last ingestion
    last_log = db.query(IngestionLog).order_by(IngestionLog.timestamp.desc()).first()
    last_ingestion_time = last_log.timestamp if last_log else None

    # Benchmarks
    benchmarks = db.query(InstitutionalBenchmark).all()
    benchmarks_summary = [InstitutionalBenchmarkSchema.model_validate(b) for b in benchmarks]

    return StatsOverviewResponse(
        total_proposals=total_proposals,
        total_parties=total_parties,
        total_sources_monitored=total_sources,
        proposals_by_party=proposals_by_party,
        proposals_by_topic=proposals_by_topic,
        fact_check_distribution=fact_check_distribution,
        quantified_cost_percentage=quantified_percentage,
        last_ingestion_time=last_ingestion_time,
        benchmarks_summary=benchmarks_summary
    )
