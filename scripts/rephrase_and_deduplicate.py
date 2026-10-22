import os
import sys
import json
import re

db_path = os.path.abspath('backend/politiclens.db')
os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
sys.path.insert(0, os.path.abspath('backend'))

from app.database import SessionLocal
from app.models import PoliticalParty, PoliticalProposal
from app.ai.embeddings import _local_deterministic_embedding
from app.ingestion.dossier_generator import update_all_party_dossiers

def rephrase_and_deduplicate():
    db = SessionLocal()
    try:
        print("[1/4] Merging duplicate proposals per party...")
        # (proposal_id_to_keep, proposal_id_to_delete)
        duplicates_to_merge = [
            (2, 38),   # FdI Cuneo fiscale
            (12, 43),  # FdI Fondo Sanitario
            (14, 71),  # FdI NATO / Difesa
            (18, 58),  # Lega Scuola 4+2
            (5, 33),   # Lega Flat Tax
            (6, 47),   # FI Pensioni minime
            (19, 56),  # FI Ius Scholae
            (36, 97),  # FI IRPEF 33%
            (1, 37),   # PD Salario minimo
            (11, 42),  # PD Sanità 7.5%
            (17, 59),  # PD Scuola pubblica
            (15, 63),  # M5S Stop armi / pace
            (150, 160),# PLD Contrattazione territoriale
            (152, 163),# Radicali Carceri
            (154, 165),# PRC Scala mobile
            (157, 169),# DSP Sovranità monetaria
        ]

        for keep_id, delete_id in duplicates_to_merge:
            to_del = db.query(PoliticalProposal).filter(PoliticalProposal.id == delete_id).first()
            if to_del:
                print(f"  Merging & deleting duplicate ID {delete_id} into ID {keep_id} ({to_del.partito})")
                db.delete(to_del)
        db.commit()

        print("[2/4] Rewriting declarations into short, concise, and punchy statements...")
        # Mapping of proposal IDs to brief, concise formulations
        concise_map = {
            # Fratelli d'Italia
            2: "Taglio strutturale del cuneo fiscale contributivo per redditi fino a 35.000€",
            8: "Ritorno al nucleare pulito con reattori modulari SMR entro il 2035",
            12: "Fondo Sanitario a 136.5 miliardi e CUP unico per abbattere le liste d'attesa",
            14: "Spesa militare NATO al 2% del PIL e supporto strategico all'Alleanza Atlantica",
            20: "Separazione delle carriere tra magistrati requirenti e giudicanti con doppio CSM",
            30: "Moratoria fino a 180 giorni sui pignoramenti per famiglie in sovraindebitamento",
            32: "Riforma IRPEF a tre aliquote (23%, 35%, 43%) e concordato preventivo biennale",
            51: "Neutralità tecnologica nel Green Deal europeo e apertura ai biocarburanti italiani",
            52: "Premierato con elezione diretta del Presidente del Consiglio e norma antiribaltone",
            55: "Protocollo Italia-Albania per la gestione extra-UE di asilo e rimpatri",
            62: "Piano Mattei per l'Africa con dotazione di 5.5 miliardi per cooperazione ed energia",
            65: "Gestazione per altri (GPA) come reato universale e tutela della natalità",
            74: "Tetto al prezzo del gas e crediti d'imposta straordinari contro il caro bollette",
            79: "Scorporo degli investimenti strategici in energia e difesa dal Patto di Stabilità UE",

            # Partito Democratico
            1: "Salario minimo legale universale a 9 euro lordi l'ora per spazzare via il lavoro povero",
            10: "Installazione di 10 GW annui di rinnovabili e istituzione del Reddito Energetico",
            11: "Fondo Sanitario Nazionale vincolato al 7.5% del PIL e 30.000 assunzioni di medici",
            17: "Asili nido gratuiti, scuola a tempo pieno e stipendi docenti allineati alla media UE",
            34: "IRPEF progressiva, stop ai condoni e contributo di solidarietà sui patrimoni oltre 5 milioni",
            48: "Pensione di Garanzia per giovani precari e ripristino pieno di Opzione Donna",
            57: "Superamento della Legge Bossi-Fini, chiusura dei CPR e introduzione dello Ius Soli",
            64: "Legge sul Fine Vita (suicidio assistito), matrimonio egualitario e approvazione DDL Zan",

            # Movimento 5 Stelle
            3: "Settimana lavorativa corta a 32 ore a parità di stipendio e nuovo Reddito di Cittadinanza",
            15: "Stop all'invio di armi in Ucraina, no al 2% PIL per la difesa e conferenza di pace ONU",
            35: "Tassazione straordinaria al 100% degli extraprofitti di banche ed energia contro il carovita",
            61: "Stop al Ponte sullo Stretto di Messina e dirottamento di 13.5 miliardi su ferrovie e acque",
            104: "Contrarietà a patrimoniali ordinarie e priorità assoluta alla tassazione degli extraprofitti",

            # Lega - Salvini Premier
            5: "Flat Tax al 15% per autonomi fino a 100.000€ e nuova rottamazione delle cartelle",
            18: "Riforma della filiera tecnica '4+2' (superiori + ITS Academy) e voto di condotta",
            46: "Quota 41 pura per andare in pensione con 41 anni di contributi senza penalizzazioni",
            49: "Ritorno al nucleare civile con reattori modulari per coprire il 20% dei consumi elettrici",
            53: "Attuazione integrale dell'Autonomia Differenziata regionale con definizione preventiva dei LEP",
            60: "Costruzione del Ponte sullo Stretto di Messina a campata unica ferro-stradale",
            92: "Anticipo dell'uscita pensionistica a 64 anni e destinazione facoltativa del TFR alla previdenza",
            96: "Riforma della legittima difesa con presunzione assoluta ed esenzione dalle spese legali",

            # Forza Italia
            6: "Aumento graduale di tutte le pensioni minime a 1.000 euro al mese entro il 2027",
            19: "Ius Scholae: cittadinanza italiana ai minori stranieri dopo 10 anni di scuola dell'obbligo",
            36: "Riduzione del secondo scaglione IRPEF al 33% esteso a 60.000€ e no tax area under 30",
            45: "Convenzioni con la sanità privata accreditata per azzerare le liste d'attesa SSN",
            54: "Separazione delle carriere tra magistrati requirenti e giudicanti e sdoppiamento del CSM",
            100: "Piano straordinario di rigenerazione urbana da 600 milioni a sostegno dei negozi di vicinato",

            # Alleanza Verdi e Sinistra
            7: "Next Generation Tax: imposta progressiva sui grandi patrimoni oltre 5 milioni di euro",
            9: "100% energie rinnovabili entro il 2035 e cancellazione di 22 miliardi di sussidi fossili (SAD)",
            41: "Salario minimo a 10 euro netti l'ora, stop agli appalti a cascata e reato di omicidio sul lavoro",
            50: "Moratoria immediata su nuove trivellazioni e sblocco autorizzativo di eolico e solare",

            # Azione
            4: "Azzeramento totale delle imposte per i giovani under 30 nei primi tre anni di lavoro",
            13: "Attivazione della linea sanitaria del MES da 37 miliardi per ospedali e pronto soccorso",
            114: "Aumento del prelievo su giochi e tabacchi a integrale copertura del taglio accise carburanti",
            115: "Commissione d'inchiesta e sanzioni contro disinformazione online e interferenze estere",
            116: "Obbligo di asseverazione preventiva dei costi da parte dell'UPB per ogni proposta elettorale",

            # Italia Viva
            173: "Elezione diretta del Presidente del Consiglio (Sindaco d'Italia) e fine bicameralismo",
            174: "Piano 'Italia Semplice': sblocco immediato delle grandi opere commissariate",
            175: "Decontribuzione totale al 100% per 3 anni per assunzioni stabili di giovani under 35",

            # +Europa
            16: "Esercito comune europeo, Eurobond per la difesa e superamento del diritto di veto nel Consiglio UE",
            66: "Legalizzazione e tassazione della cannabis per oltre 7 miliardi di gettito erariale",
            177: "Legge sull'eutanasia legale, testamento biologico vincolante e accesso alle cure palliative",

            # Noi Moderati
            135: "Pubblicazione obbligatoria e comparativa dei costi effettivi e tempi d'attesa sanitari",
            136: "Obbligo di copertura finanziaria asseverata dall'UPB per ogni proposta politica",
            178: "IRES premiale per le PMI che reinvestono almeno il 60% degli utili in beni 4.0 o assunzioni",
            179: "Detrazione fiscale al 100% per le famiglie per le rette di asili nido e scuole paritarie",

            # Partito Liberal Democratico
            149: "Spending review selettiva da 15 miliardi per tagliare le aliquote IRPEF e IRES alle imprese",
            150: "Salari legati alla produttività territoriale e contrattazione aziendale con clausola di opt-out",

            # Radicali Italiani
            151: "Legalizzazione e monopolio di Stato sulla cannabis per finanziare sanità e ricerca",
            152: "Numero chiuso nelle carceri e case territoriali di reinserimento contro il sovraffollamento",

            # Rifondazione Comunista
            153: "Imposta patrimoniale progressiva a partire da 1 milione con aliquota fino al 3%",
            154: "Ripristino della scala mobile per adeguare automaticamente salari e pensioni all'inflazione",
            166: "Nazionalizzazione dei colossi energetici e delle reti con tariffe sociali calmierate",

            # Potere al Popolo
            155: "Salario minimo legale a 10 euro netti all'ora indicizzato all'inflazione e stop al precariato",
            168: "Blocco degli sfratti per morosità incolpevole ed esproprio sociale degli alloggi sfitti",

            # Futuro Nazionale
            156: "Blocco navale concordato nel Mediterraneo e rigetto dei ricollocamenti obbligatori UE",
            161: "Requisito di residenza a 15 anni e test di integrazione civica per l'accesso alla cittadinanza",
            162: "Flat tax al 15% per famiglie con figli (quoziente patriottico) e sgravi per madri lavoratrici",

            # Democrazia Sovrana Popolare
            157: "Uscita dall'Eurozona, disconoscimento dei vincoli UE e ripristino della sovranità monetaria",
            170: "Uscita immediata dell'Italia dalla NATO, neutralità permanente e cancellazione delle sanzioni",

            # Südtiroler Volkspartei
            158: "Ripristino e ampliamento delle competenze statutarie dell'Autonomia Speciale dell'Alto Adige",
            172: "Trasferimento del trasporto merci su rotaia sull'asse del Brennero e intermodalità alpina",

            # ORA!
            180: "Azzeramento totale delle imposte per i primi 5 anni per startup e nuove imprese under 35",
            181: "Fascicolo unico digitale del cittadino e dimezzamento dei tempi per le autorizzazioni PA",
            182: "Tariffa unica regionale integrata per il trasporto pubblico e incentivi colonnine di ricarica"
        }

        for pid, concise_text in concise_map.items():
            prop = db.query(PoliticalProposal).filter(PoliticalProposal.id == pid).first()
            if prop:
                # Save previous declaration as part of raw_text / context if not already there
                if not prop.raw_text or len(prop.raw_text) < 40:
                    prop.raw_text = f"{prop.dichiarazione_sintesi}. Monitoraggio web PoliticLens: proposta avanzata da {prop.partito} in materia di {prop.macro_argomento}."
                prop.dichiarazione_sintesi = concise_text
                emb = _local_deterministic_embedding(f"{prop.partito} {prop.macro_argomento} {prop.dichiarazione_sintesi}")
                prop.embedding = json.dumps(emb)

        db.commit()

        # Check any remaining proposals
        all_props = db.query(PoliticalProposal).all()
        for p in all_props:
            t = p.dichiarazione_sintesi.strip()
            # If still longer than 150 chars, simplify
            if len(t) > 140:
                words = t.split()
                if len(words) > 16:
                    simplified = " ".join(words[:15]).rstrip(" ,;.")
                    print(f"  Shortening remaining long proposal ID {p.id}: {simplified}")
                    p.dichiarazione_sintesi = simplified
                    p.embedding = json.dumps(_local_deterministic_embedding(f"{p.partito} {p.macro_argomento} {p.dichiarazione_sintesi}"))
        db.commit()

        print("[3/4] Updating AI dossiers for all 18 parties...")
        update_all_party_dossiers(db)
        print("  Dossiers updated successfully.")

        print("[4/4] Exporting to backend/app/data/seed_data.py...")
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

        proposals = db.query(PoliticalProposal).all()
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
            f.write("# Seed data auto-generated with short, concise syntheses and rich detailed evidence\n")
            f.write("import datetime\n\n")
            f.write(f"PARTIES_SEED = {json.dumps(parties_data, ensure_ascii=False, indent=2)}\n\n")
            f.write(f"PROPOSALS_SEED = {json.dumps(proposals_data, ensure_ascii=False, indent=2)}\n")

        print(f"  Successfully wrote {len(parties_data)} parties and {len(proposals_data)} proposals to seed_data.py")
        print(f"Total proposals now in DB: {len(proposals)}")

    except Exception as e:
        db.rollback()
        print(f"Error in rephrase_and_deduplicate: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    rephrase_and_deduplicate()
