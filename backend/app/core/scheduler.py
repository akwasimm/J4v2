"""
Scheduler Module - APScheduler for periodic tasks.
Handles weekly Sunday 6 AM IST refresh of Big Opportunities data.
"""

import logging
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
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


def start_scheduler():
    """Start the APScheduler with weekly Sunday 6 AM IST trigger."""
    # Sunday 6 AM IST = Sunday 00:30 UTC (IST is UTC+5:30)
    # Cron: day_of_week=6 (Sunday), hour=0, minute=30 for UTC
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
    
    scheduler.start()
    logger.info("Scheduler started - Next refresh: Sunday 6:00 AM IST")


def stop_scheduler():
    """Stop the scheduler."""
    scheduler.shutdown()
    logger.info("Scheduler stopped")
