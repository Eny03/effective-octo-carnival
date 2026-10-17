import os
import sys
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.database import SessionLocal, engine
from app.models import PoliticalParty, PoliticalProposal
from app.ingestion.dossier_generator import update_all_party_dossiers
from app.data.seed_data import PARTIES_SEED

# Official national polling averages Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto (October 2026)
# and fully audited party metadata
PARTY_ACCURATE_DATA = {
    "FDI": {
        "poll_percentage": 27.2,
        "poll_trend": "+0.4%",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "PD": {
        "poll_percentage": 20.1,
        "poll_trend": "-0.3%",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "M5S": {
        "poll_percentage": 12.4,
        "poll_trend": "-0.4%",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "FI": {
        "poll_percentage": 7.4,
        "poll_trend": "stabile",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "FUTNAZ": {
        "name": "Futuro Nazionale",
        "leader": "Roberto Vannacci (Presidente), Massimiliano Simoni (Coordinatore)",
        "coalition": "Destra Identitaria / Sovranismo",
        "official_website": "https://futuronazionale.it",
        "description": "Movimento politico conservatore, identitario ed euroscettico fondato da Roberto Vannacci nel febbraio 2026 (aderente al gruppo europeo ESN). Punti cardine: codice V.I.T.A.L.E., sovranità nazionale, difesa dei confini, contrasto all'immigrazione clandestina e tutela della famiglia tradizionale.",
        "poll_percentage": 7.2,
        "poll_trend": "-0.5%",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "AVS": {
        "poll_percentage": 6.4,
        "poll_trend": "+0.1%",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "LEGA": {
        "poll_percentage": 6.0,
        "poll_trend": "+0.3%",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "AZ": {
        "poll_percentage": 3.2,
        "poll_trend": "stabile",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "IV": {
        "poll_percentage": 2.4,
        "poll_trend": "+0.2%",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "PIUEU": {
        "poll_percentage": 1.7,
        "poll_trend": "stabile",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "LIBDEM": {
        "name": "Partito Liberal Democratico",
        "leader": "Luigi Marattin (Segretario Nazionale)",
        "coalition": "Centro / Liberaldemocratici",
        "official_website": "https://partitoliberaldemocratico.com",
        "description": "Partito liberale, atlantista ed europeista promosso da Luigi Marattin (aderente ad ALDE). Fari programmatici: spending review selettiva da 15 miliardi per tagliare IRPEF e IRES, salari legati alla produttività, concorrenza e pragmatismo energetico con apertura al nucleare.",
        "poll_percentage": 1.4,
        "poll_trend": "+0.1%",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "NM": {
        "poll_percentage": 1.2,
        "poll_trend": "+0.1%",
        "poll_sources": "Supermedia YouTrend/AGI, SWG, Ipsos, Tecnè, Noto",
    },
    "ORA": {
        "name": "ORA!",
        "leader": "Alberto Forchielli (Presidente), Michele Boldrin (Segretario Nazionale)",
        "coalition": "Centro Riformatore / Indipendenti",
        "official_website": "https://ora-italia.it",
        "description": "Movimento politico liberale, meritocratico e pragmatico fondato da Alberto Forchielli e Michele Boldrin, evolutosi dall'esperienza di Drin Drin. Punti cardine: rilancio della produttività e salari reali, spending review su spesa improduttiva, contrasto alla fuga dei cervelli e semplificazione burocratica basata sui dati.",
        "poll_percentage": 1.1,
        "poll_trend": "+0.1%",
        "poll_sources": "Media rilevazioni YouTrend, SWG, Noto Sondaggi",
    },
    "DSP": {
        "poll_percentage": 1.0,
        "poll_trend": "stabile",
        "leader": "Marco Rizzo, Francesco Toscano",
        "official_website": "https://democraziasovranapopolare.it",
        "poll_sources": "Media YouTrend/AGI, SWG, Noto",
    },
    "PRC": {
        "poll_percentage": 0.8,
        "poll_trend": "stabile",
        "leader": "Maurizio Acerbo (Segretario Nazionale)",
        "official_website": "https://www.rifondazione.it",
        "poll_sources": "Media YouTrend/AGI, SWG, Noto",
    },
    "PAP": {
        "poll_percentage": 0.7,
        "poll_trend": "stabile",
        "leader": "Giuliano Granato, Marta Collot (Coordinatori Nazionali)",
        "official_website": "https://poterealpopolo.org",
        "poll_sources": "Media YouTrend/AGI, SWG, Noto",
    },
    "RAD": {
        "poll_percentage": 0.6,
        "poll_trend": "stabile",
        "leader": "Matteo Hallissey (Segretario), Giulia Crivellini (Tesoriera)",
        "official_website": "https://www.radicali.it",
        "poll_sources": "Media YouTrend/AGI, SWG, Noto",
    },
    "SVP": {
        "name": "Südtiroler Volkspartei",
        "poll_percentage": 0.5,
        "poll_trend": "stabile",
        "leader": "Dieter Steger (Obmann)",
        "official_website": "https://www.svp.eu",
        "poll_sources": "Media YouTrend/AGI, SWG, Noto",
    }
}

def sync_database_and_seed():
    db = SessionLocal()
    try:
        print("[UpdateScript] Sincronizzazione database politilens.db...")
        # 1. Update PoliticalParty records in database
        for code, data in PARTY_ACCURATE_DATA.items():
            party = db.query(PoliticalParty).filter(PoliticalParty.code == code).first()
            if party:
                for k, v in data.items():
                    setattr(party, k, v)
                print(f"  Aggiornato partito {code} ({party.name}): poll {party.poll_percentage}%, leader: {party.leader}")
            else:
                print(f"  AVVISO: Partito {code} non trovato in DB!")
        db.commit()

        # 2. Update AI dossiers & calculated scores for all parties
        print("[UpdateScript] Rigenerazione Dossier AI e metriche veridicità/coperture...")
        update_all_party_dossiers(db)
        db.commit()

        # 3. Read back parties and verify
        parties = db.query(PoliticalParty).order_by(PoliticalParty.poll_percentage.desc()).all()
        print(f"\n[Verifica Database] Totale partiti: {len(parties)}")
        for p in parties:
            props_count = db.query(PoliticalProposal).filter(
                (PoliticalProposal.party_id == p.id) | (PoliticalProposal.partito.ilike(f"%{p.name}%"))
            ).count()
            print(f"  {p.poll_percentage:4.1f}% | {p.code:6} | {p.name:<30} | Veridicità: {p.truthfulness_score}% | Coperture: {p.financial_reliability_score}% | Atti: {props_count}")

        # 4. Now update backend/app/data/seed_data.py PARTIES_SEED array
        seed_data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "app", "data", "seed_data.py"))
        with open(seed_data_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Update in-memory PARTIES_SEED
        updated_parties_seed = []
        for p in PARTIES_SEED:
            p_copy = dict(p)
            code = p_copy["code"]
            if code in PARTY_ACCURATE_DATA:
                p_copy.update(PARTY_ACCURATE_DATA[code])
            # also sync calculated scores from DB
            db_p = next((x for x in parties if x.code == code), None)
            if db_p:
                p_copy["truthfulness_score"] = db_p.truthfulness_score
                p_copy["financial_reliability_score"] = db_p.financial_reliability_score
                if db_p.dossier_ai:
                    p_copy["dossier_ai"] = db_p.dossier_ai
            updated_parties_seed.append(p_copy)

        # Write clean updated seed file
        # We replace the PARTIES_SEED section in content
        # Find where PROPOSALS_SEED starts
        idx_proposals = content.find("PROPOSALS_SEED = [")
        if idx_proposals != -1:
            proposals_content = content[idx_proposals:]
            new_parties_code = "import datetime\n\nPARTIES_SEED = " + json.dumps(updated_parties_seed, indent=2, ensure_ascii=False) + "\n\n"
            new_file_content = new_parties_code + proposals_content
            with open(seed_data_path, "w", encoding="utf-8") as f:
                f.write(new_file_content)
            print(f"[UpdateScript] File seed_data.py riscritto con successo con dati accurati e dossier AI sincronizzati!")

    except Exception as e:
        db.rollback()
        print(f"[UpdateScript] Errore: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    sync_database_and_seed()
