import json
import datetime
from app.database import SessionLocal, engine, Base
from app.models import PoliticalParty, PoliticalProposal, InstitutionalBenchmark
from app.data.seed_data import PARTIES_SEED, PROPOSALS_SEED
from app.data.benchmark_data import BENCHMARKS_SEED
from app.ai.embeddings import _local_deterministic_embedding

def enrich_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print("[Enrich] Inizio sincronizzazione e popolamento completo database...")
        
        # 1. Update/Insert Parties
        for p_data in PARTIES_SEED:
            existing = db.query(PoliticalParty).filter(PoliticalParty.code == p_data["code"]).first()
            if not existing:
                party = PoliticalParty(**p_data)
                db.add(party)
            else:
                existing.name = p_data["name"]
                existing.leader = p_data["leader"]
                existing.coalition = p_data["coalition"]
                existing.color = p_data["color"]
                existing.description = p_data["description"]
                existing.official_website = p_data["official_website"]
        db.commit()
        
        parties_map = {p.name: p.id for p in db.query(PoliticalParty).all()}
        # Also map short forms
        for p in db.query(PoliticalParty).all():
            parties_map[p.code] = p.id
            if "Lega" in p.name:
                parties_map["Lega"] = p.id
            if "Fratelli" in p.name:
                parties_map["FdI"] = p.id
                parties_map["Fratelli d'Italia"] = p.id
            if "Democratico" in p.name:
                parties_map["PD"] = p.id
            if "5 Stelle" in p.name:
                parties_map["M5S"] = p.id

        # 2. Insert Benchmarks
        for b_data in BENCHMARKS_SEED:
            existing = db.query(InstitutionalBenchmark).filter(InstitutionalBenchmark.indicatore == b_data["indicatore"]).first()
            if not existing:
                db.add(InstitutionalBenchmark(**b_data))
            else:
                existing.valore = b_data["valore"]
                existing.descrizione = b_data.get("descrizione")
                existing.url_fonte = b_data.get("url_fonte")
        db.commit()

        # 3. Insert or update Proposals
        inserted_count = 0
        updated_count = 0
        
        for prop in PROPOSALS_SEED:
            # Check by declaration text match
            existing = db.query(PoliticalProposal).filter(
                PoliticalProposal.partito == prop["partito"],
                PoliticalProposal.macro_argomento == prop["macro_argomento"],
                PoliticalProposal.dichiarazione_sintesi == prop["dichiarazione_sintesi"]
            ).first()
            
            party_id = parties_map.get(prop["partito"])
            emb_list = _local_deterministic_embedding(f"{prop['partito']} {prop['macro_argomento']} {prop['dichiarazione_sintesi']}")
            
            if not existing:
                new_prop = PoliticalProposal(
                    party_id=party_id,
                    partito=prop["partito"],
                    macro_argomento=prop["macro_argomento"],
                    dichiarazione_sintesi=prop["dichiarazione_sintesi"],
                    tipo_azione=prop["tipo_azione"],
                    costo_stimato=prop["costo_stimato"],
                    coperture_dichiarate=prop["coperture_dichiarate"],
                    fattibilita_finanziaria=prop["fattibilita_finanziaria"],
                    fact_check_status=prop["fact_check_status"],
                    fact_check_motivazione=prop["fact_check_motivazione"],
                    fact_check_fonte=prop["fact_check_fonte"],
                    fonte_url=prop["fonte_url"],
                    fonte_titolo=prop["fonte_titolo"],
                    fonte_testata=prop["fonte_testata"],
                    embedding=json.dumps(emb_list),
                    timestamp=prop["timestamp"]
                )
                db.add(new_prop)
                inserted_count += 1
            else:
                existing.tipo_azione = prop["tipo_azione"]
                existing.costo_stimato = prop["costo_stimato"]
                existing.coperture_dichiarate = prop["coperture_dichiarate"]
                existing.fattibilita_finanziaria = prop["fattibilita_finanziaria"]
                existing.fact_check_status = prop["fact_check_status"]
                existing.fact_check_motivazione = prop["fact_check_motivazione"]
                existing.fact_check_fonte = prop["fact_check_fonte"]
                existing.fonte_url = prop["fonte_url"]
                existing.fonte_titolo = prop["fonte_titolo"]
                existing.fonte_testata = prop["fonte_testata"]
                existing.embedding = json.dumps(emb_list)
                updated_count += 1
                
        db.commit()
        
        total_p = db.query(PoliticalProposal).count()
        total_parties = db.query(PoliticalParty).count()
        print(f"[Enrich] Successo! Partiti nel database: {total_parties}. Proposte totali: {total_p} (Inserite: {inserted_count}, Aggiornate: {updated_count})")
        
    except Exception as e:
        db.rollback()
        print(f"[Enrich] Errore: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    enrich_database()
