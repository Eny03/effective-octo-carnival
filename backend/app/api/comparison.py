from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PoliticalProposal, PoliticalParty
from app.schemas import ComparisonMatrixResponse, TopicComparisonRow, ComparisonCell, PoliticalPartySchema, PoliticalProposalDetail

router = APIRouter(prefix="/api/comparison", tags=["Manifesto Dinamico & Comparatore"])

MACRO_ARGOMENTI_DEFAULT = [
    "Lavoro",
    "Economia",
    "Energia",
    "Ambiente",
    "Sanità",
    "Istruzione",
    "Diritti Civili",
    "Esteri"
]

@router.get("/matrix", response_model=ComparisonMatrixResponse)
def get_comparison_matrix(db: Session = Depends(get_db)):
    """
    Builds the Dynamic Comparative Manifesto (Manifesto Dinamico).
    Generates a 2D matrix of Macro-Topic vs Political Parties with synthesized stances.
    """
    parties = db.query(PoliticalParty).order_by(PoliticalParty.coalition, PoliticalParty.name).all()
    proposals = db.query(PoliticalProposal).order_by(PoliticalProposal.timestamp.desc()).all()
    
    # Map proposals by (macro_topic, party_name_clean)
    grid_map: Dict[str, Dict[str, List[PoliticalProposal]]] = {
        topic: {p.name: [] for p in parties} for topic in MACRO_ARGOMENTI_DEFAULT
    }
    
    for prop in proposals:
        topic = prop.macro_argomento
        if topic not in grid_map:
            grid_map[topic] = {p.name: [] for p in parties}
            
        for party in parties:
            if party.name.lower() in prop.partito.lower() or prop.partito.lower() in party.name.lower():
                grid_map[topic][party.name].append(prop)
                break

    rows: List[TopicComparisonRow] = []
    
    for topic in grid_map.keys():
        party_cells: Dict[str, ComparisonCell] = {}
        for party in parties:
            p_list = grid_map[topic].get(party.name, [])
            
            # Determine stance type
            stance = "In attesa di posizione depositata"
            synthesis = "Nessun atto o dichiarazione formale censita di recente su questo macro-tema."
            
            if p_list:
                latest = p_list[0]
                synthesis = latest.dichiarazione_sintesi
                if latest.tipo_azione == "Opposizione":
                    stance = "Contrario / Opposizione"
                elif latest.tipo_azione == "Proposta di legge":
                    stance = "Favorevole / Riformista"
                elif "copertur" in latest.coperture_dichiarate.lower():
                    stance = "Focalizzato su Coperture"
                else:
                    stance = "Dichiarazione programmatica"
                    
            details = [PoliticalProposalDetail.model_validate(p) for p in p_list]
            for d in details:
                d.party_color = party.color

            party_cells[party.name] = ComparisonCell(
                partito=party.name,
                party_color=party.color,
                proposals=details,
                sintesi_posizione=synthesis,
                stance_type=stance
            )
            
        rows.append(TopicComparisonRow(
            macro_argomento=topic,
            argomento_dettaglio=f"Quadro comparativo delle posizioni sul tema {topic}",
            parties=party_cells
        ))
        
    return ComparisonMatrixResponse(
        macro_argomenti=list(grid_map.keys()),
        partiti=[PoliticalPartySchema.model_validate(p) for p in parties],
        matrix=rows
    )
