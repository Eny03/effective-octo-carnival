import os
import sys
import json
import re

# Point DATABASE_URL directly to backend/politilens.db
db_path = os.path.abspath('backend/politilens.db')
os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath('backend'))

from app.database import SessionLocal, engine
from app.models import PoliticalParty, PoliticalProposal, IngestionLog
from app.ingestion.dossier_generator import update_all_party_dossiers
from app.ai.embeddings import _local_deterministic_embedding

def clean_database():
    db = SessionLocal()
    try:
        print(f"[0/5] Connected to database: {db_path}")
        print("[1/5] Removing invalid proposals (journalistic chatter, commentary, gossip, un-rephrased headlines)...")
        delete_ids = [
            21,  # "PD sul salario minimo" (stub)
            70,  # "Landini annuncia lo sciopero generale..." (erroneously attributed to FdI)
            93,  # "L'ira di Meloni che non stoppa la riforma..." (gossip)
            94,  # "Vannacci conta più di Salvini..." (gossip)
            95,  # exact duplicate of 92
            105, # duplicate/gossip headline "Botta e risposta..." (AVS already has 7)
            112, # "Il punto in comune tra le proposte di AVS e Azione..." (chatter)
            113, # "Il punto in comune tra le proposte di AVS e Azione..." (chatter)
            134, # "Manovra, spuntano 2 miliardi..." (government maneuver misattributed to PD)
            142, # Lega minimum wage (Lega opposes minimum wage)
            144, # "Schillaci suona l'allarme, ma il Governo Meloni..." (critic headline)
            145, # "Fondi per famiglie, imprese e sanità: Sicilia..." (regional Sicilian budget)
            176, # duplicate of 16 (+Europa Eurobond)
            88,  # duplicate of 15 (M5S stop armi)
            159, # duplicate of 149 (PLD spending review)
            167, # duplicate of 155 (PaP salario minimo)
            164, # duplicate of 151 (Radicali cannabis)
            171, # duplicate of 158 (SVP autonomia)
        ]
        
        for pid in delete_ids:
            prop = db.query(PoliticalProposal).filter(PoliticalProposal.id == pid).first()
            if prop:
                print(f"  Deleting proposal {pid} ({prop.partito} - {prop.dichiarazione_sintesi[:50]}...)")
                db.delete(prop)
        db.commit()

        print("[2/5] Rephrasing proposals into authentic, clean policy declarations...")
        rephrases = {
            71: {
                "dichiarazione_sintesi": "Riaffermazione degli impegni atlantici per la difesa comune, deterrenza contro l'aggressione russa e ammodernamento dei sistemi di sicurezza della NATO",
                "tipo_azione": "Dichiarazione programmatica",
                "macro_argomento": "Esteri"
            },
            74: {
                "dichiarazione_sintesi": "Misure governative straordinarie per il contenimento delle tariffe energetiche, introduzione del tetto al prezzo del gas e crediti d'imposta per famiglie e PMI",
                "tipo_azione": "Dichiarazione programmatica",
                "macro_argomento": "Energia"
            },
            79: {
                "dichiarazione_sintesi": "Richiesta formale all'Unione Europea di scorporare gli investimenti strategici in sicurezza energetica e difesa dai vincoli del Patto di Stabilità",
                "tipo_azione": "Dichiarazione programmatica",
                "macro_argomento": "Esteri"
            },
            96: {
                "dichiarazione_sintesi": "Riforma della legittima difesa con presunzione assoluta di non punibilità ed esenzione dalle spese legali per le vittime di intrusioni violente",
                "tipo_azione": "Proposta di legge",
                "macro_argomento": "Giustizia"
            },
            100: {
                "dichiarazione_sintesi": "Piano straordinario di rigenerazione urbana e sostegno al commercio di vicinato con fondo di riqualificazione da 600 milioni di euro",
                "tipo_azione": "Proposta di legge",
                "macro_argomento": "Economia"
            },
            104: {
                "dichiarazione_sintesi": "Contrarietà a imposte patrimoniali pure e priorità assoluta alla tassazione straordinaria al 100% degli extraprofitti finanziari ed energetici",
                "tipo_azione": "Opposizione",
                "macro_argomento": "Economia"
            }
        }

        for pid, data in rephrases.items():
            prop = db.query(PoliticalProposal).filter(PoliticalProposal.id == pid).first()
            if prop:
                print(f"  Rephrasing proposal {pid} ({prop.partito}): '{data['dichiarazione_sintesi'][:60]}...'")
                prop.dichiarazione_sintesi = data["dichiarazione_sintesi"]
                prop.tipo_azione = data["tipo_azione"]
                prop.macro_argomento = data["macro_argomento"]
                emb = _local_deterministic_embedding(f"{prop.partito} {prop.macro_argomento} {prop.dichiarazione_sintesi}")
                prop.embedding = json.dumps(emb)
        db.commit()

        # Sanitize any remaining proposals
        print("[3/5] Sanitizing all remaining proposals...")
        all_props = db.query(PoliticalProposal).all()
        for p in all_props:
            text = p.dichiarazione_sintesi
            orig = text
            # Remove journal suffixes
            text = re.sub(r"\s*-\s*(?:ANSA|Il Sole 24 Ore|Il Sole 24 ORE|Corriere della Sera|Corriere|la Repubblica|La Repubblica|RaiNews|AGI|il manifesto|il Giornale|Il Foglio|Il Fatto Quotidiano|Fanpage|LiveSicilia|Adnkronos|Pagella Politica|Quotidiano Sanit[àa]|fratelli-italia\.it).*$", "", text, flags=re.IGNORECASE)
            # Remove "Indirizzo programmatico in materia di X: "
            text = re.sub(r"^Indirizzo programmatico in materia di [^:]+:\s*", "", text, flags=re.IGNORECASE)
            # Clean outer quotes
            text = text.strip(' «»"\'').strip()
            if text != orig:
                print(f"  Cleaned text for ID {p.id}: '{text[:70]}...'")
                p.dichiarazione_sintesi = text
                emb = _local_deterministic_embedding(f"{p.partito} {p.macro_argomento} {p.dichiarazione_sintesi}")
                p.embedding = json.dumps(emb)

        db.commit()

        print("[4/5] Updating AI Dossiers for all 18 political parties...")
        update_all_party_dossiers(db)
        print("  Dossiers updated successfully.")

        print("[5/5] Exporting clean data to backend/app/data/seed_data.py...")
        parties = db.query(PoliticalParty).all()
        parties_data = []
        for party in parties:
            parties_data.append({
                "code": party.code,
                "name": party.name,
                "coalition": party.coalition,
                "leader": party.leader,
                "color": party.color,
                "official_website": party.official_website,
                "description": party.description,
                "poll_percentage": party.poll_percentage,
                "poll_trend": party.poll_trend,
                "poll_sources": party.poll_sources,
                "truthfulness_score": party.truthfulness_score,
                "financial_reliability_score": party.financial_reliability_score,
                "dossier_ai": party.dossier_ai
            })

        proposals = db.query(PoliticalProposal).order_id() if hasattr(PoliticalProposal, "order_id") else db.query(PoliticalProposal).all()
        proposals_data = []
        for prop in proposals:
            proposals_data.append({
                "partito": prop.partito,
                "macro_argomento": prop.macro_argomento,
                "dichiarazione_sintesi": prop.dichiarazione_sintesi,
                "tipo_azione": prop.tipo_azione,
                "costo_stimato": prop.costo_stimato,
                "coperture_dichiarate": prop.coperture_dichiarate,
                "fattibilita_finanziaria": prop.fattibilita_finanziaria,
                "fact_check_status": prop.fact_check_status,
                "fact_check_motivazione": prop.fact_check_motivazione,
                "fact_check_fonte": prop.fact_check_fonte,
                "fonte_url": prop.fonte_url,
                "fonte_titolo": prop.fonte_titolo,
                "fonte_testata": prop.fonte_testata,
                "timestamp": prop.timestamp.isoformat() if prop.timestamp else "2026-10-17T12:00:00"
            })

        seed_file_path = os.path.abspath('backend/app/data/seed_data.py')
        with open(seed_file_path, "w", encoding="utf-8") as f:
            f.write("# Seed data auto-generated from clean database with 18 parties and rigorous policy proposals\n")
            f.write("import datetime\n\n")
            f.write(f"PARTIES_SEED = {json.dumps(parties_data, ensure_ascii=False, indent=2)}\n\n")
            f.write(f"PROPOSALS_SEED = {json.dumps(proposals_data, ensure_ascii=False, indent=2)}\n")

        print(f"  Successfully wrote {len(parties_data)} parties and {len(proposals_data)} proposals to seed_data.py")
        print("\nAll tasks completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error cleaning database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    clean_database()
