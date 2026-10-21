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
                curr.poll_percentage = p_data.get("poll_percentage", curr.poll_percentage)
                curr.poll_trend = p_data.get("poll_trend", curr.poll_trend)
                curr.poll_sources = p_data.get("poll_sources", curr.poll_sources)
                curr.truthfulness_score = p_data.get("truthfulness_score", curr.truthfulness_score)
                curr.financial_reliability_score = p_data.get("financial_reliability_score", curr.financial_reliability_score)
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

        # Non-destructive Proposal Persistence (Preserve full historical record 2022-2026)
        parties_map = {p.name: p.id for p in db.query(PoliticalParty).all()}
        from app.ai.embeddings import _local_deterministic_embedding

        all_seeds = PROPOSALS_SEED + HISTORICAL_PROPOSALS_SEED
        existing_proposals = db.query(PoliticalProposal).all()
        existing_signatures = {
            (p.partito.strip(), p.macro_argomento.strip(), p.dichiarazione_sintesi.strip().lower()[:40])
            for p in existing_proposals
        }
        existing_hashes = {p.content_hash for p in existing_proposals if p.content_hash}

        added_count = 0
        for prop in all_seeds:
            sig = (prop["partito"].strip(), prop["macro_argomento"].strip(), prop["dichiarazione_sintesi"].strip().lower()[:40])
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
            print(f"[Database] Successfully seeded/updated {added_count} policy proposals (including historical 2022-2026 archive). Total proposals: {db.query(PoliticalProposal).count()}")
        else:
            print(f"[Database] All proposals are up to date and preserved in history ({len(existing_proposals)} total).")

        # Update all party dossiers on startup
        try:
            from app.ingestion.dossier_generator import update_all_party_dossiers
            update_all_party_dossiers(db)
        except Exception as de:
            print(f"[Database] Dossier update notice: {de}")

    except Exception as e:
        db.rollback()
        print(f"[Database] Seeding error: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[PolitiLens] Inizializzazione piattaforma e database...")
    seed_database_if_empty()
    start_scheduler()
    yield
    print("[PolitiLens] Arresto servizi...")
    stop_scheduler()

app = FastAPI(
    title="PolitiLens Backend API",
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

    @app.get("/")
    async def serve_root():
        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return await health_check()

    @app.get("/{full_path:path}")
    async def serve_catch_all(full_path: str):
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
