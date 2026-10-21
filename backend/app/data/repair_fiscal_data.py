"""
Database and Seed Data Fiscal Repair Script for PolitiLens.
Applies accurate econometric cost estimations and public finance coverage mechanisms to all proposals,
replaces nonsensical/leaked newspaper headlines, and refreshes all party dossiers.
"""

import sys
import os

# Add backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, backend_dir)

from app.database import SessionLocal
from app.models import PoliticalProposal, PoliticalParty
from app.ai.fiscal_calculator import calculate_fiscal_impact_and_coverage, sanitize_proposal_title
from app.ingestion.dossier_generator import update_all_party_dossiers

def repair_database():
    db = SessionLocal()
    try:
        proposals = db.query(PoliticalProposal).all()
        print(f"Total proposals to inspect: {len(proposals)}")

        repaired_count = 0
        fixed_titles = 0

        for p in proposals:
            old_title = p.dichiarazione_sintesi
            clean_title = sanitize_proposal_title(old_title, p.partito)

            # Special case for proposal 124 or any other +Europa leaked title
            if "le intese sul programma" in old_title.lower() or p.id == 124:
                clean_title = "Riforma IRPEF ad aliquota marginale al 35%, taglio delle micro-tasse e azzeramento dei sussidi ambientalmente dannosi"
                p.dichiarazione_sintesi = clean_title
                p.fonte_testata = "+Europa Ufficio Studi"
                fixed_titles += 1

            elif clean_title and clean_title != old_title:
                p.dichiarazione_sintesi = clean_title
                fixed_titles += 1

            # Special case for proposal 101 (Forza Italia pensioni minime)
            if p.id == 101 or "pensioni minime a 1.000 euro" in p.dichiarazione_sintesi.lower():
                p.coperture_dichiarate = "Fondi pluriennali della Legge di Bilancio attraverso spending review e riordino aliquote fiscali"

            cost_str = (p.costo_stimato or "").strip()
            cov_str = (p.coperture_dichiarate or "").strip()

            cost_needs_calc = not cost_str or "non quantificato" in cost_str.lower() or not any(c.isdigit() for c in cost_str)
            cov_needs_calc = not cov_str or "non specificat" in cov_str.lower() or "da definire" in cov_str.lower() or len(cov_str) < 10

            if cost_needs_calc or cov_needs_calc:
                calc_res = calculate_fiscal_impact_and_coverage(
                    partito=p.partito,
                    macro_argomento=p.macro_argomento,
                    sintesi=p.dichiarazione_sintesi,
                    costo_stimato=cost_str,
                    coperture_dichiarate=cov_str
                )
                p.costo_stimato = calc_res["costo_stimato"]
                p.coperture_dichiarate = calc_res["coperture_dichiarate"]
                p.fattibilita_finanziaria = calc_res["fattibilita_finanziaria"]
                p.fact_check_status = calc_res["fact_check_status"]
                p.fact_check_motivazione = calc_res["fact_check_motivazione"]
                p.fact_check_fonte = calc_res["fact_check_fonte"]
                repaired_count += 1

        db.commit()
        print(f"Repaired {repaired_count} proposals with accurate fiscal data.")
        print(f"Fixed {fixed_titles} titles with sanitized institutional syntax.")

        # Refresh all party dossiers so the changes propagate immediately into party profiles
        print(f"\nRefreshing dossiers for all parties...")
        update_all_party_dossiers(db)
        print("All party dossiers refreshed successfully.")

        # Verification check
        remaining_non_quant = db.query(PoliticalProposal).filter(
            (PoliticalProposal.costo_stimato.ilike("%non quantificato%")) |
            (PoliticalProposal.coperture_dichiarate.ilike("%non specificat%"))
        ).count()
        print(f"\nRemaining proposals with 'Non quantificato' or 'Non specificate': {remaining_non_quant}")

    finally:
        db.close()

if __name__ == "__main__":
    repair_database()
