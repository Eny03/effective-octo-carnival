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
                # Find matching party in database to link FK
                party_obj = db.query(PoliticalParty).filter(
                    (PoliticalParty.name.ilike(f"%{item.partito}%")) |
                    (PoliticalParty.code.ilike(f"%{item.partito}%"))
                ).first()
                party_id = party_obj.id if party_obj else None

                # Compute embedding
                text_to_embed = f"{item.partito} {item.macro_argomento} {item.dichiarazione_sintesi}"
                emb_list = await get_text_embedding(text_to_embed)
                emb_json = json.dumps(emb_list) if emb_list else None
                item_hash = compute_content_hash(f"{item.partito}_{item.macro_argomento}_{item.dichiarazione_sintesi}")

                # AI Semantic Deduplication & Policy Evolution
                from app.ai.policy_merger import find_matching_existing_proposal, merge_or_update_policy_proposal
                matching_existing = find_matching_existing_proposal(
                    db=db,
                    party_id=party_id,
                    partito=item.partito,
                    macro_argomento=item.macro_argomento,
                    dichiarazione_sintesi=item.dichiarazione_sintesi,
                    emb_list=emb_list
                )

                if matching_existing:
                    # Update existing proposal with the newest position / amended details
                    print(f"[AI Ingestion] Aggiornamento posizione per {item.partito} ({item.macro_argomento}): '{item.dichiarazione_sintesi[:60]}...'")
                    merge_or_update_policy_proposal(
                        db=db,
                        existing=matching_existing,
                        item=item,
                        url=art["url"],
                        title=art["title"],
                        source_name=art["source_name"],
                        published_at=art["published_at"],
                        raw_text=raw_text,
                        content_hash=item_hash,
                        emb_json=emb_json
                    )
                else:
                    dt = datetime.datetime.fromisoformat(item.timestamp) if item.timestamp else art["published_at"]
                    proposal_record = PoliticalProposal(
                        party_id=party_id,
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
                
        # Autonomously synthesize and update AI Dossiers for all political parties
        try:
            from app.ingestion.dossier_generator import update_all_party_dossiers
            update_all_party_dossiers(db)
        except Exception as de:
            print(f"[Scheduler] AI Dossier generation warning: {de}")

        # Record Ingestion Log
        log_entry = IngestionLog(
            source_name="AI Universal Web Crawler & Monitor",
            source_url="Scansione Web Nazionale & Feed Istituzionali (ANSA, Sole 24 Ore, Rai, Quotidiani, Partiti)",
            articles_found=total_articles,
            proposals_extracted=total_proposals,
            status="SUCCESS",
            log_message=f"Scansione completata: {total_articles} articoli analizzati dal web, {total_proposals} nuove posizioni politiche estratte e dossier AI aggiornati."
        )
        db.add(log_entry)
        db.commit()
        print(f"[Scheduler] Pipeline completed: {total_articles} articles, {total_proposals} proposals extracted, dossiers updated.")
    except Exception as e:
        db.rollback()
        print(f"[Scheduler] Ingestion error: {e}")
        try:
            err_log = IngestionLog(
                source_name="AI Universal Web Crawler & Monitor",
                source_url="Web & Feeds",
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
    """Starts the continuous 24/7 background scheduler (running at :00, :10, :20, :30, :40, :50)."""
    if settings.ENABLE_AUTO_SCHEDULER and not scheduler.running:
        scheduler.add_job(
            _scheduler_job,
            "cron",
            minute="*/10",
            second="0",
            id="political_rss_monitor",
            replace_existing=True
        )
        scheduler.start()
        print(f"[Scheduler] Continuous 24/7 background scheduler active (triggering at :00, :10, :20, :30, :40, :50).")

def stop_scheduler():
    """Stops the background scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)

def get_scheduler_status():
    """Returns current scheduler state, interval, server time, and exact next run time."""
    is_active = scheduler.running
    next_run = None
    if is_active:
        job = scheduler.get_job("political_rss_monitor")
        if job and job.next_run_time:
            next_run = job.next_run_time.isoformat()
            
    server_now = datetime.datetime.utcnow().isoformat() + "Z"

    return {
        "is_active": is_active,
        "interval_minutes": 10,
        "interval_seconds": 600,
        "frequency": "Continuo 24/7 ogni 10 minuti (ai minuti :00, :10, :20, :30, :40, :50)",
        "server_time": server_now,
        "next_run_time": next_run
    }

