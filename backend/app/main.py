import os
import json
import asyncio
import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import PoliticalParty, PoliticalProposal, InstitutionalBenchmark
from app.data.benchmark_data import BENCHMARKS_SEED
from app.data.seed_data import PARTIES_SEED, PROPOSALS_SEED
from app.data.historical_proposals import HISTORICAL_PROPOSALS_SEED
from app.ingestion.text_extractor import compute_content_hash
from app.ai.embeddings import get_text_embedding
from app.ai.ollama_client import ollama_client
from app.ingestion.scheduler import start_scheduler, stop_scheduler

from app.api.parties import router as parties_router
from app.api.proposals import router as proposals_router
from app.api.comparison import router as comparison_router
from app.api.chat import router as chat_router
from app.api.ingestion import router as ingestion_router
from app.api.stats import router as stats_router
from app.api.audit import router as audit_router, seed_audit_history_if_empty


def seed_database_if_empty():
    """Seeds initial parties, documented proposals, and economic benchmarks if not present."""
    from sqlalchemy import text
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:
            for col, ctype in [
                ("dossier_ai", "TEXT"),
                ("poll_percentage", "FLOAT"),
                ("poll_trend", "VARCHAR(20)"),
                ("poll_sources", "VARCHAR(255)"),
                ("truthfulness_score", "FLOAT"),
                ("financial_reliability_score", "FLOAT")
            ]:
                try:
                    conn.execute(text(f"ALTER TABLE political_parties ADD COLUMN {col} {ctype}"))
                    conn.commit()
                except Exception:
                    pass
    except Exception:
        pass
    db: Session = SessionLocal()
    try:
        # Seed or sync parties
        existing_parties = {p.code: p for p in db.query(PoliticalParty).all()}
        for p_data in PARTIES_SEED:
            code = p_data["code"]
            if code not in existing_parties:
                print(f"[Database] Adding new party: {p_data['name']}")
                new_party = PoliticalParty(**p_data)
                db.add(new_party)
            else:
                curr = existing_parties[code]
                curr.name = p_data.get("name", curr.name)
                curr.coalition = p_data.get("coalition", curr.coalition)
                curr.leader = p_data.get("leader", curr.leader)
                curr.color = p_data.get("color", curr.color)
                curr.description = p_data.get("description", curr.description)
                curr.official_website = p_data.get("official_website", curr.official_website)
                # CRITICAL: Preserve dynamic live poll data & truthfulness scores across server restarts/deploys
                if curr.poll_percentage is None or curr.poll_percentage == 0.0:
                    curr.poll_percentage = p_data.get("poll_percentage", 0.0)
                if not curr.poll_trend:
                    curr.poll_trend = p_data.get("poll_trend", "stabile")
                if not curr.poll_sources:
                    curr.poll_sources = p_data.get("poll_sources", "Media YouTrend/AGI, SWG, Ipsos, Tecnè, Noto")
                if curr.truthfulness_score is None or curr.truthfulness_score == 0.0:
                    curr.truthfulness_score = p_data.get("truthfulness_score", 80.0)
                if curr.financial_reliability_score is None or curr.financial_reliability_score == 0.0:
                    curr.financial_reliability_score = p_data.get("financial_reliability_score", 80.0)
                if not curr.dossier_ai and p_data.get("dossier_ai"):
                    curr.dossier_ai = p_data.get("dossier_ai")
        db.commit()

        # Seed Benchmarks
        if db.query(InstitutionalBenchmark).count() == 0:
            print("[Database] Seeding institutional benchmarks...")
            for b_data in BENCHMARKS_SEED:
                benchmark = InstitutionalBenchmark(**b_data)
                db.add(benchmark)
            db.commit()

        # Non-destructive Proposal Persistence with Intelligent Deduplication
        parties_map = {p.name: p.id for p in db.query(PoliticalParty).all()}
        from app.ai.embeddings import _local_deterministic_embedding
        from difflib import SequenceMatcher

        stopwords = {'e', 'il', 'la', 'i', 'gli', 'le', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'del', 'della', 'dei', 'delle', 'un', 'una', 'uno', 'al', 'alla', 'ai', 'alle'}

        # Deduplicate all seed proposals before inserting
        deduped_seeds = []
        for prop in (PROPOSALS_SEED + HISTORICAL_PROPOSALS_SEED):
            p_text = prop["dichiarazione_sintesi"].lower()
            p_words = {w for w in p_text.replace(',', ' ').replace('.', ' ').replace(':', ' ').split() if w not in stopwords and len(w) > 3}
            
            is_dup = False
            for existing_idx, existing_seed in enumerate(deduped_seeds):
                if existing_seed["partito"] == prop["partito"] and existing_seed["macro_argomento"] == prop["macro_argomento"]:
                    e_text = existing_seed["dichiarazione_sintesi"].lower()
                    e_words = {w for w in e_text.replace(',', ' ').replace('.', ' ').replace(':', ' ').split() if w not in stopwords and len(w) > 3}
                    common = p_words & e_words
                    overlap = len(common) / max(len(p_words), len(e_words)) if max(len(p_words), len(e_words)) > 0 else 0
                    ratio = SequenceMatcher(None, p_text, e_text).ratio()
                    
                    if (overlap >= 0.30 or len(common) >= 3 or ratio >= 0.35):
                        is_dup = True
                        # If current prop is more detailed or formal, replace the existing one
                        if len(prop["dichiarazione_sintesi"]) > len(existing_seed["dichiarazione_sintesi"]):
                            deduped_seeds[existing_idx] = prop
                        break
            if not is_dup:
                deduped_seeds.append(prop)

        # Seed missing clean proposals
        existing_proposals = db.query(PoliticalProposal).all()
        existing_signatures = {
            (p.partito.strip(), p.macro_argomento.strip(), p.dichiarazione_sintesi.strip().lower()[:35])
            for p in existing_proposals
        }
        existing_hashes = {p.content_hash for p in existing_proposals if p.content_hash}

        added_count = 0
        for prop in deduped_seeds:
            sig = (prop["partito"].strip(), prop["macro_argomento"].strip(), prop["dichiarazione_sintesi"].strip().lower()[:35])
            hash_key = compute_content_hash(f"{prop['partito']}_{prop['macro_argomento']}_{prop['dichiarazione_sintesi']}")
            
            if sig not in existing_signatures and hash_key not in existing_hashes:
                party_id = parties_map.get(prop["partito"])
                emb_list = _local_deterministic_embedding(f"{prop['partito']} {prop['macro_argomento']} {prop['dichiarazione_sintesi']}")
                
                ts_val = prop.get("timestamp")
                if isinstance(ts_val, str):
                    try:
                        ts_val = datetime.datetime.fromisoformat(ts_val)
                    except Exception:
                        ts_val = datetime.datetime.utcnow()
                elif not isinstance(ts_val, datetime.datetime):
                    ts_val = datetime.datetime.utcnow()

                record = PoliticalProposal(
                    party_id=party_id,
                    partito=prop["partito"],
                    macro_argomento=prop["macro_argomento"],
                    dichiarazione_sintesi=prop["dichiarazione_sintesi"],
                    tipo_azione=prop.get("tipo_azione", "Dichiarazione programmatica"),
                    costo_stimato=prop.get("costo_stimato", "Non quantificato"),
                    coperture_dichiarate=prop.get("coperture_dichiarate", "Non specificate"),
                    fattibilita_finanziaria=prop.get("fattibilita_finanziaria"),
                    fact_check_status=prop.get("fact_check_status", "In attesa di copertura"),
                    fact_check_motivazione=prop.get("fact_check_motivazione"),
                    fact_check_fonte=prop.get("fact_check_fonte"),
                    fonte_url=prop.get("fonte_url", ""),
                    fonte_titolo=prop.get("fonte_titolo"),
                    fonte_testata=prop.get("fonte_testata"),
                    raw_text=prop.get("raw_text") or f"{prop['dichiarazione_sintesi']}. Posizione politica formalizzata da {prop['partito']} in materia di {prop['macro_argomento']}.",
                    content_hash=hash_key,
                    embedding=json.dumps(emb_list) if emb_list else None,
                    timestamp=ts_val
                )
                db.add(record)
                existing_signatures.add(sig)
                existing_hashes.add(hash_key)
                added_count += 1

        if added_count > 0:
            db.commit()
            print(f"[Database] Successfully seeded {added_count} policy proposals.")

        # Post-Seed Database Deduplication Pass: Remove any duplicated proposals across all topics
        existing_db_props = db.query(PoliticalProposal).order_by(PoliticalProposal.id).all()
        by_grp = {}
        db_to_delete = []
        for p in existing_db_props:
            grp_key = (p.partito.strip().lower(), p.macro_argomento.strip().lower())
            clean_text = p.dichiarazione_sintesi.lower().replace(',', ' ').replace('.', ' ').replace(':', ' ').replace('(', ' ').replace(')', ' ').replace("'", ' ').replace(';', ' ')
            p_words = {w for w in clean_text.split() if w not in stopwords and len(w) > 3}
            if grp_key not in by_grp:
                by_grp[grp_key] = [(p, p_words)]
            else:
                dup_found = False
                for prev_p, prev_words in by_grp[grp_key]:
                    common = p_words & prev_words
                    ratio = SequenceMatcher(None, p.dichiarazione_sintesi.lower(), prev_p.dichiarazione_sintesi.lower()).ratio()
                    if (len(common) >= 3 or ratio >= 0.35):
                        dup_found = True
                        # Keep the longer, more descriptive one
                        if len(p.dichiarazione_sintesi) > len(prev_p.dichiarazione_sintesi):
                            db_to_delete.append(prev_p)
                        else:
                            db_to_delete.append(p)
                        break
                if not dup_found:
                    by_grp[grp_key].append((p, p_words))

        for dp in db_to_delete:
            try:
                db.delete(dp)
            except Exception:
                pass
        if db_to_delete:
            db.commit()
            print(f"[Database] Post-seed clean: deleted {len(db_to_delete)} duplicate proposals from database.")

        print(f"[Database] All proposals are up to date and deduplicated ({db.query(PoliticalProposal).count()} total).")


        # Realistic Public Finance Audit: Art. 81 Cost. & Legge 196/2009
        try:
            from app.ai.fiscal_calculator import sanitize_proposal_title
            all_db_props = db.query(PoliticalProposal).all()
            
            FORMAL_ACT_KEYWORDS = [
                "legge", "decreto", "ddl", "a.c.", "a.s.", "atto di governo", 
                "delibera", "l.", "d.l.", "d.lgs.", "l. 86/2024", "l. 159/2024", "l. 14/2024"
            ]

            for p in all_db_props:
                clean_t = sanitize_proposal_title(p.dichiarazione_sintesi, p.partito)
                if "le intese sul programma" in p.dichiarazione_sintesi.lower():
                    clean_t = "Riforma IRPEF ad aliquota marginale al 35%, taglio delle micro-tasse e azzeramento dei sussidi ambientalmente dannosi"
                    p.fonte_testata = "+Europa Ufficio Studi"
                if clean_t and clean_t != p.dichiarazione_sintesi:
                    p.dichiarazione_sintesi = clean_t

                act_str = (p.tipo_azione or "").lower()
                text_str = (p.dichiarazione_sintesi or "").lower()
                is_formal = any(k in act_str or k in text_str for k in FORMAL_ACT_KEYWORDS)

                # Programmatic declarations / commitments are NOT treated as costed laws:
                if not is_formal or "dichiarazione programmatica" in act_str or "opposizione" in act_str:
                    p.costo_stimato = "Non quantificato"
                    p.coperture_dichiarate = "Non specificate (In attesa di DDL formale e Relazione Tecnica MEF)"
                    p.fact_check_status = "In attesa di copertura"
                    p.fact_check_motivazione = (
                        "Trattandosi di dichiarazione di indirizzo politico o promessa elettorale priva di disegno di legge "
                        "depositato con Relazione Tecnica asseverata dalla Ragioneria Generale dello Stato (art. 17 L. 196/2009), "
                        "ai sensi dell'art. 81 Cost. la copertura finanziaria non risulta formalmente asseverata."
                    )
            db.commit()
            print("[Database] Realistic Art. 81 public finance audit applied cleanly.")
        except Exception as fe:
            print(f"[Database] Fiscal audit notice: {fe}")


        # Update all party dossiers on startup
        try:
            from app.ingestion.dossier_generator import update_all_party_dossiers
            update_all_party_dossiers(db)
        except Exception as de:
            print(f"[Database] Dossier update notice: {de}")

        # Seed initial audit history
        try:
            seed_audit_history_if_empty(db)
        except Exception as ae:
            print(f"[Database] Audit seed notice: {ae}")

    except Exception as e:
        db.rollback()
        print(f"[Database] Seeding error: {e}")
    finally:
        db.close()

async def _autonomous_self_keepalive():
    """
    Autonomous Keepalive: pings the public Render URL every 7 minutes.
    Because Render monitors incoming HTTP traffic on politclens.onrender.com, this public request
    resets Render's 15-minute idle timer, preventing the free tier container from sleeping.
    """
    await asyncio.sleep(45)  # Let server complete initial startup
    external_url = os.environ.get("RENDER_EXTERNAL_URL", "https://politclens.onrender.com")
    health_endpoint = f"{external_url.rstrip('/')}/api/health"
    print(f"[Keepalive] Autonomous 24/7 background keepalive loop started (target: {health_endpoint}).")
    
    while True:
        try:
            import urllib.request
            req = urllib.request.Request(
                health_endpoint,
                headers={"User-Agent": "PoliticLens-Autonomous-Keepalive/2.0 (+https://politclens.onrender.com)"}
            )
            # Run in thread pool to avoid blocking async event loop
            loop = asyncio.get_running_loop()
            def do_ping():
                with urllib.request.urlopen(req, timeout=15) as resp:
                    return resp.getcode()
            status = await loop.run_in_executor(None, do_ping)
            print(f"[Keepalive] Public ping status: {status} -> Render 15-min idle timer reset.")
        except Exception as e:
            print(f"[Keepalive] Public ping notice (will retry in 7 min): {e}")
        # Ping every 7 minutes (420 seconds) - safely below Render's 15-minute (900 seconds) timeout
        await asyncio.sleep(420)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[PoliticLens] Inizializzazione piattaforma e database...")
    seed_database_if_empty()
    start_scheduler()
    
    # Autonomous startup poll sync (in background after 2 seconds)
    async def _startup_poll_sync():
        await asyncio.sleep(2)
        try:
            db_sync = SessionLocal()
            from app.ingestion.poll_tracker import run_poll_tracker_pipeline
            print("[PoliticLens] Sincronizzazione demoscopica iniziale all'avvio...")
            run_poll_tracker_pipeline(db_sync)
            db_sync.close()
        except Exception as e:
            print(f"[PoliticLens] Notice sincronizzazione demoscopica avvio: {e}")

    asyncio.create_task(_startup_poll_sync())
    keepalive_task = asyncio.create_task(_autonomous_self_keepalive())
    yield
    print("[PoliticLens] Arresto servizi...")
    keepalive_task.cancel()
    stop_scheduler()

app = FastAPI(
    title="PoliticLens Backend API",
    description="Analizzatore e Comparatore Politico Autonomo, neutrale e 100% open-source.",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(parties_router)
app.include_router(proposals_router)
app.include_router(comparison_router)
app.include_router(chat_router)
app.include_router(ingestion_router)
app.include_router(stats_router)
app.include_router(audit_router)


@app.get("/api/health")
async def health_check():
    ollama_ok = await ollama_client.is_available()
    models = await ollama_client.list_models() if ollama_ok else []
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "neutrality_policy": "Absolute Political Impartiality & Institutional Fact-Checking",
        "ollama_connected": ollama_ok,
        "ollama_models": models
    }

# Unified Frontend Serving
# Find static files directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "..", "static")

if os.path.exists(STATIC_DIR):
    # Mount _next assets
    next_dir = os.path.join(STATIC_DIR, "_next")
    if os.path.exists(next_dir):
        app.mount("/_next", StaticFiles(directory=next_dir), name="next_assets")

    @app.get("/icon.svg")
    async def serve_icon():
        return FileResponse(os.path.join(STATIC_DIR, "icon.svg"))

    @app.get("/manifest.json")
    async def serve_manifest():
        return FileResponse(os.path.join(STATIC_DIR, "manifest.json"))

    @app.get("/favicon.ico")
    async def serve_favicon():
        return FileResponse(os.path.join(STATIC_DIR, "favicon.ico"))

    @app.get("/compare")
    async def serve_compare():
        return FileResponse(os.path.join(STATIC_DIR, "compare.html"))

    @app.get("/chat")
    async def serve_chat():
        return FileResponse(os.path.join(STATIC_DIR, "chat.html"))

    @app.get("/fact-check")
    async def serve_factcheck():
        return FileResponse(os.path.join(STATIC_DIR, "fact-check.html"))

    @app.get("/parties")
    async def serve_parties():
        return FileResponse(os.path.join(STATIC_DIR, "parties.html"))

    @app.get("/sources")
    async def serve_sources():
        return FileResponse(os.path.join(STATIC_DIR, "sources.html"))

    @app.get("/audit")
    async def serve_audit():
        return FileResponse(os.path.join(STATIC_DIR, "audit.html"))

    @app.get("/")

    async def serve_root():
        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return await health_check()

    @app.get("/{full_path:path}")
    async def serve_catch_all(full_path: str):
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        html_file = os.path.join(STATIC_DIR, f"{full_path}.html")
        if os.path.isfile(html_file):
            return FileResponse(html_file)
        # Default fallback to index.html
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    @app.get("/")
    async def root():
        return await health_check()
