from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import PoliticalParty, PoliticalProposal
from app.schemas import PoliticalPartySchema, PoliticalProposalDetail

router = APIRouter(prefix="/api/parties", tags=["Partiti Politici"])

@router.get("", response_model=List[PoliticalPartySchema])
def list_parties(db: Session = Depends(get_db)):
    """Returns all registered political parties with current proposal count."""
    parties = db.query(PoliticalParty).order_by(PoliticalParty.coalition, PoliticalParty.name).all()
    results = []
    for p in parties:
        count = db.query(func.count(PoliticalProposal.id)).filter(PoliticalProposal.party_id == p.id).scalar() or 0
        if count == 0:
            count = db.query(func.count(PoliticalProposal.id)).filter(PoliticalProposal.partito.ilike(f"%{p.name}%")).scalar() or 0
            
        party_data = PoliticalPartySchema(
            id=p.id,
            code=p.code,
            name=p.name,
            coalition=p.coalition,
            leader=p.leader,
            color=p.color,
            official_website=p.official_website,
            description=p.description,
            proposals_count=count
        )
        results.append(party_data)
    return results

@router.get("/{party_code_or_id}")
def get_party_detail(party_code_or_id: str, db: Session = Depends(get_db)):
    """Returns specific party profile with all associated proposals and thematic distribution."""
    party = None
    if party_code_or_id.isdigit():
        party = db.query(PoliticalParty).filter(PoliticalParty.id == int(party_code_or_id)).first()
    if not party:
        party = db.query(PoliticalParty).filter(PoliticalParty.code.ilike(party_code_or_id)).first()
    if not party:
        party = db.query(PoliticalParty).filter(PoliticalParty.name.ilike(f"%{party_code_or_id}%")).first()

    if not party:
        raise HTTPException(status_code=404, detail="Partito politico non trovato")

    proposals = db.query(PoliticalProposal).filter(
        (PoliticalProposal.party_id == party.id) | (PoliticalProposal.partito.ilike(f"%{party.name}%"))
    ).order_by(PoliticalProposal.timestamp.desc()).all()

    # Topic distribution
    topic_counts = {}
    for prop in proposals:
        topic_counts[prop.macro_argomento] = topic_counts.get(prop.macro_argomento, 0) + 1

    return {
        "party": PoliticalPartySchema.model_validate(party),
        "total_proposals": len(proposals),
        "topic_distribution": topic_counts,
        "proposals": [PoliticalProposalDetail.model_validate(p) for p in proposals]
    }
