from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import PoliticalProposal, PoliticalParty
from app.schemas import PoliticalProposalDetail

router = APIRouter(prefix="/api/proposals", tags=["Proposte e Posizioni Politiche"])

@router.get("", response_model=List[PoliticalProposalDetail])
def get_proposals(
    party: Optional[str] = Query(None, description="Filtra per nome partito o codice"),
    topic: Optional[str] = Query(None, description="Filtra per macro-argomento"),
    status: Optional[str] = Query(None, description="Filtra per fact_check_status"),
    action_type: Optional[str] = Query(None, description="Filtra per tipo_azione"),
    search: Optional[str] = Query(None, description="Ricerca testuale nella sintesi o coperture"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns filtered political proposals with pagination and metadata.
    """
    query = db.query(PoliticalProposal)

    if party:
        query = query.filter(PoliticalProposal.partito.ilike(f"%{party}%"))
    if topic:
        query = query.filter(PoliticalProposal.macro_argomento.ilike(f"%{topic}%"))
    if status:
        query = query.filter(PoliticalProposal.fact_check_status.ilike(f"%{status}%"))
    if action_type:
        query = query.filter(PoliticalProposal.tipo_azione.ilike(f"%{action_type}%"))
    if search:
        query = query.filter(
            or_(
                PoliticalProposal.dichiarazione_sintesi.ilike(f"%{search}%"),
                PoliticalProposal.coperture_dichiarate.ilike(f"%{search}%"),
                PoliticalProposal.fattibilita_finanziaria.ilike(f"%{search}%")
            )
        )

    proposals = query.order_by(PoliticalProposal.timestamp.desc()).offset(offset).limit(limit).all()

    # Pre-fetch parties for color mapping
    parties_map = {p.name.lower(): p.color for p in db.query(PoliticalParty).all()}

    output = []
    for p in proposals:
        detail = PoliticalProposalDetail.model_validate(p)
        detail.party_color = parties_map.get(p.partito.lower(), "#3b82f6")
        output.append(detail)
        
    return output

@router.get("/{proposal_id}", response_model=PoliticalProposalDetail)
def get_proposal_by_id(proposal_id: int, db: Session = Depends(get_db)):
    """Returns a single proposal by ID."""
    p = db.query(PoliticalProposal).filter(PoliticalProposal.id == proposal_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposta non trovata")
    
    party = db.query(PoliticalParty).filter(PoliticalParty.id == p.party_id).first() if p.party_id else None
    detail = PoliticalProposalDetail.model_validate(p)
    detail.party_color = party.color if party else "#3b82f6"
    return detail
