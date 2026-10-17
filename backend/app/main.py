import os
import json
import asyncio
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
            conn.execute(text("ALTER TABLE political_parties ADD COLUMN dossier_ai TEXT"))
            conn.commit()
    except Exception:
        pass
    db: Session = SessionLocal()
    try:
        # Seed Parties
        if db.query(PoliticalParty).count() == 0:
            print("[Database] Seeding political parties...")
            for p_data in PARTIES_SEED:
                party = PoliticalParty(**p_data)
                db.add(party)
            db.commit()

        # Seed Benchmarks
        if db.query(InstitutionalBenchmark).count() == 0:
            print("[Database] Seeding institutional benchmarks...")
            for b_data in BENCHMARKS_SEED:
                benchmark = InstitutionalBenchmark(**b_data)
                db.add(benchmark)
            db.commit()

        # Seed Proposals
        if db.query(PoliticalProposal).count() == 0:
            print("[Database] Seeding documented proposals and precomputing embeddings...")
            parties_map = {p.name: p.id for p in db.query(PoliticalParty).all()}
            
            for prop in PROPOSALS_SEED:
                party_id = parties_map.get(prop["partito"])
                from app.ai.embeddings import _local_deterministic_embedding
                emb_list = _local_deterministic_embedding(f"{prop['partito']} {prop['macro_argomento']} {prop['dichiarazione_sintesi']}")
                
                record = PoliticalProposal(
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
                db.add(record)
            db.commit()
            print(f"[Database] Successfully seeded {len(PROPOSALS_SEED)} political proposals.")
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
