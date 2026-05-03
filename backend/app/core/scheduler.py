"""
Scheduler Module - APScheduler for periodic tasks.
Handles:
- Weekly Sunday 6 AM IST refresh of Big Opportunities data
- Job search cache warming every 5 minutes
- Dashboard cache warming every hour
- Daily cache cleanup
"""

import logging
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.services.opportunities_service import refresh_all_opportunities

logger = logging.getLogger(__name__)

# Create scheduler instance
scheduler = AsyncIOScheduler()


async def refresh_opportunities_task():
    """Scheduled task to refresh all opportunities data."""
    logger.info("Starting scheduled opportunities refresh...")
    
    db = SessionLocal()
    try:
        result = refresh_all_opportunities(db)
        logger.info(f"Scheduled refresh completed: {result}")
    except Exception as e:
        logger.error(f"Scheduled refresh failed: {e}")
    finally:
        db.close()


async def warm_job_search_cache_task():
    """Warm job search cache every 5 minutes for fast loads."""
    from app.services.cache_warmer import warm_common_job_searches
    try:
        await warm_common_job_searches()
    except Exception as e:
        logger.error(f"Job search cache warming failed: {e}")


async def warm_dashboard_cache_task():
    """Warm dashboard cache every hour."""
    from app.services.cache_warmer import warm_dashboard_cache
    try:
        await warm_dashboard_cache()
    except Exception as e:
        logger.error(f"Dashboard cache warming failed: {e}")


async def cleanup_cache_task():
    """Clean up stale cache entries daily."""
    from app.services.cache_warmer import invalidate_stale_caches
    try:
        await invalidate_stale_caches()
    except Exception as e:
        logger.error(f"Cache cleanup failed: {e}")


def start_scheduler():
    """Start the APScheduler with all background tasks."""
    
    # 1. Weekly Big Opportunities refresh - Sunday 6 AM IST
    scheduler.add_job(
        refresh_opportunities_task,
        trigger=CronTrigger(
            day_of_week=6,  # Sunday (0=Monday, 6=Sunday)
            hour=0,         # 00:30 UTC = 6:00 AM IST
            minute=30,
            timezone="UTC"
        ),
        id="refresh_opportunities",
        name="Weekly Big Opportunities Refresh",
        replace_existing=True
    )
    
    # 2. Job search cache warming - every 5 minutes
    scheduler.add_job(
        warm_job_search_cache_task,
        trigger=IntervalTrigger(minutes=5),
        id="warm_job_search_cache",
        name="Job Search Cache Warming",
        replace_existing=True
    )
    
    # 3. Dashboard cache warming - every hour
    scheduler.add_job(
        warm_dashboard_cache_task,
        trigger=IntervalTrigger(hours=1),
        id="warm_dashboard_cache",
        name="Dashboard Cache Warming",
        replace_existing=True
    )
    
    # 4. Cache cleanup - daily at 3 AM UTC
    scheduler.add_job(
        cleanup_cache_task,
        trigger=CronTrigger(hour=3, minute=0, timezone="UTC"),
        id="cleanup_cache",
        name="Daily Cache Cleanup",
        replace_existing=True
    )
    
    scheduler.start()
    
    # Log all scheduled jobs
    logger.info("Scheduler started with jobs:")
    for job in scheduler.get_jobs():
        logger.info(f"  - {job.name}: {job.trigger}")


def stop_scheduler():
    """Stop the scheduler."""
    scheduler.shutdown()
    logger.info("Scheduler stopped")
