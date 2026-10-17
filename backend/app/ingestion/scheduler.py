import json
import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.config import settings
from app.models import PoliticalProposal, PoliticalParty, IngestionLog
from app.ingestion.rss_fetcher import fetch_all_active_feeds
from app.ingestion.text_extractor import compute_content_hash
from app.ai.extractor import extract_proposals_from_text
from app.ai.embeddings import get_text_embedding

scheduler = BackgroundScheduler()

async def run_pipeline_scan():
    """
    Executes a complete scanning pass over monitored RSS feeds:
    1. Fetches new articles.
    2. Filters and deduplicates against database.
    3. Runs AI extraction & fact-checking.
    4. Computes embeddings.
    5. Saves proposals and creates an IngestionLog entry.
    """
    db: Session = SessionLocal()
    total_articles = 0
    total_proposals = 0
    
    try:
        articles = fetch_all_active_feeds(max_items_per_feed=settings.MAX_ARTICLES_PER_FEED)
        total_articles = len(articles)
        
        for art in articles:
            raw_text = art["raw_text"]
            content_hash = compute_content_hash(raw_text)
            
            # Check deduplication
            existing = db.query(PoliticalProposal).filter(PoliticalProposal.content_hash == content_hash).first()
            if existing:
                continue
                
            extracted_items = await extract_proposals_from_text(
                text=raw_text,
                url=art["url"],
                title=art["title"],
                published_at=art["published_at"]
            )
            
            for item in extracted_items:
                item_hash = compute_content_hash(f"{art['url']}_{item.partito}_{item.macro_argomento}_{item.dichiarazione_sintesi}")
                existing_item = db.query(PoliticalProposal).filter(PoliticalProposal.content_hash == item_hash).first()
                if existing_item:
                    continue

                # Find matching party in database to link FK
                party_obj = db.query(PoliticalParty).filter(
                    (PoliticalParty.name.ilike(f"%{item.partito}%")) |
                    (PoliticalParty.code.ilike(f"%{item.partito}%"))
                ).first()
                
                # Compute embedding
                text_to_embed = f"{item.partito} {item.macro_argomento} {item.dichiarazione_sintesi}"
                emb_list = await get_text_embedding(text_to_embed)
                emb_json = json.dumps(emb_list) if emb_list else None
                
                dt = datetime.datetime.fromisoformat(item.timestamp) if item.timestamp else art["published_at"]
                
                proposal_record = PoliticalProposal(
                    party_id=party_obj.id if party_obj else None,
                    partito=item.partito,
                    macro_argomento=item.macro_argomento,
                    dichiarazione_sintesi=item.dichiarazione_sintesi,
                    tipo_azione=item.tipo_azione,
                    costo_stimato=item.impatto_economico.costo_stimato,
                    coperture_dichiarate=item.impatto_economico.coperture_dichiarate,
                    fattibilita_finanziaria=item.impatto_economico.fattibilita_finanziaria,
                    fact_check_status=item.fact_check.status,
                    fact_check_motivazione=item.fact_check.motivazione_oggettiva,
                    fact_check_fonte=item.fact_check.fonte_verifica,
                    fonte_url=item.fonte_url or art["url"],
                    fonte_titolo=art["title"],
                    fonte_testata=art["source_name"],
                    raw_text=raw_text,
                    content_hash=item_hash,
                    embedding=emb_json,
                    timestamp=dt
                )
                db.add(proposal_record)
                total_proposals += 1
                
        # Record Ingestion Log
        log_entry = IngestionLog(
            source_name="RSS Scheduler Monitor",
            source_url="Multiple Active Feeds (ANSA, Sole 24 Ore, Adnkronos, RaiNews)",
            articles_found=total_articles,
            proposals_extracted=total_proposals,
            status="SUCCESS",
            log_message=f"Scansione completata: {total_articles} articoli analizzati, {total_proposals} nuove posizioni politiche estratte."
        )
        db.add(log_entry)
        db.commit()
        print(f"[Scheduler] Pipeline completed: {total_articles} articles, {total_proposals} proposals extracted.")
    except Exception as e:
        db.rollback()
        print(f"[Scheduler] Ingestion error: {e}")
        try:
            err_log = IngestionLog(
                source_name="RSS Scheduler Monitor",
                source_url="Feeds",
                articles_found=total_articles,
                proposals_extracted=total_proposals,
                status="FAILED",
                log_message=f"Errore durante l'ingestion: {str(e)}"
            )
            db.add(err_log)
            db.commit()
        except Exception:
            pass
    finally:
        db.close()

def _scheduler_job():
    """Wrapper for background scheduler thread."""
    import asyncio
    asyncio.run(run_pipeline_scan())

def start_scheduler():
    """Starts the background scheduler if enabled in settings (hourly runs)."""
    if settings.ENABLE_AUTO_SCHEDULER and not scheduler.running:
        scheduler.add_job(
            _scheduler_job,
            "interval",
            minutes=settings.INGESTION_INTERVAL_MINUTES,
            id="political_rss_monitor",
            replace_existing=True
        )
        scheduler.start()
        print(f"[Scheduler] Background political ingestion scheduler active (running every {settings.INGESTION_INTERVAL_MINUTES} minutes).")

def stop_scheduler():
    """Stops the background scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)

def get_scheduler_status():
    """Returns current scheduler state, interval, and next run time."""
    is_active = scheduler.running
    next_run = None
    if is_active:
        job = scheduler.get_job("political_rss_monitor")
        if job and job.next_run_time:
            next_run = job.next_run_time.isoformat()
            
    return {
        "is_active": is_active,
        "interval_minutes": settings.INGESTION_INTERVAL_MINUTES,
        "frequency": f"Ogni {settings.INGESTION_INTERVAL_MINUTES} minuti (continuo 24/7)",
        "next_run_time": next_run
    }
