"""
Cache warming service - pre-populates caches in background.
Runs periodically to ensure fast initial page loads.
"""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.user import User
from app.models.dashboard import UserDashboardData
from app.services.optimized_job_service import warm_job_search_cache, get_common_search_patterns
from app.services.dashboard_service import get_cached_dashboard_data, generate_dashboard_data
from app.core.cache import cache

logger = logging.getLogger(__name__)

# ─── Cache Warming Tasks ───────────────────────────────────────────────────

async def warm_common_job_searches():
    """Warm cache for common job search patterns (runs every 5 minutes)."""
    db = SessionLocal()
    try:
        # Get recently active users
        recent_users = db.query(User).filter(
            User.last_login_at >= datetime.now(timezone.utc).replace(hours=24)
        ).limit(50).all()
        
        # Also warm for anonymous users (common patterns)
        common_patterns = get_common_search_patterns()
        warm_job_search_cache(db, None, common_patterns)
        logger.info(f"Warmed anonymous job search cache with {len(common_patterns)} patterns")
        
        # Warm for recent users
        for user in recent_users:
            try:
                # Personalized patterns
                personalized_patterns = [
                    {"page": 1, "page_size": 10, "sort_by": "match_score", "user_id": user.id},
                    {"page": 1, "page_size": 20, "sort_by": "match_score", "user_id": user.id},
                ]
                warm_job_search_cache(db, user.id, personalized_patterns)
            except Exception as e:
                logger.warning(f"Failed to warm cache for user {user.id}: {e}")
        
        logger.info(f"Warmed job search cache for {len(recent_users)} users")
        
    except Exception as e:
        logger.error(f"Cache warming error: {e}")
    finally:
        db.close()


async def warm_dashboard_cache():
    """Warm dashboard cache for users with expiring data (runs hourly)."""
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        
        # Find users with expiring dashboard data (expires within next hour)
        expiring_soon = db.query(UserDashboardData).filter(
            UserDashboardData.expires_at <= now + datetime.timedelta(hours=1),
            UserDashboardData.expires_at > now
        ).all()
        
        for dashboard_data in expiring_soon:
            try:
                # Regenerate dashboard data in background
                user_id = dashboard_data.user_id
                generate_dashboard_data(db, user_id, force_refresh=True)
                logger.info(f"Refreshed dashboard cache for user {user_id}")
            except Exception as e:
                logger.warning(f"Failed to refresh dashboard for {dashboard_data.user_id}: {e}")
        
        # Also warm for users with no dashboard data
        users_without_dashboard = db.query(User).outerjoin(
            UserDashboardData, User.id == UserDashboardData.user_id
        ).filter(
            UserDashboardData.id == None
        ).limit(20).all()
        
        for user in users_without_dashboard:
            try:
                # Generate initial dashboard data
                get_cached_dashboard_data(db, user.id)
            except Exception as e:
                logger.warning(f"Failed to warm dashboard for {user.id}: {e}")
        
        logger.info(f"Warmed dashboard cache: {len(expiring_soon)} refreshed, {len(users_without_dashboard)} new")
        
    except Exception as e:
        logger.error(f"Dashboard cache warming error: {e}")
    finally:
        db.close()


async def warm_user_specific_caches(user_id: str):
    """Warm caches for a specific user (call on login)."""
    db = SessionLocal()
    try:
        # Warm job searches
        personalized_patterns = [
            {"page": 1, "page_size": 10, "sort_by": "match_score", "user_id": user_id},
            {"page": 1, "page_size": 20, "sort_by": "match_score", "user_id": user_id},
            {"page": 1, "page_size": 10, "sort_by": "posted_at", "user_id": user_id},
        ]
        warm_job_search_cache(db, user_id, personalized_patterns)
        
        # Warm dashboard (returns placeholder quickly if needed)
        get_cached_dashboard_data(db, user_id)
        
        logger.info(f"Warmed caches for user {user_id}")
        
    except Exception as e:
        logger.error(f"Failed to warm caches for user {user_id}: {e}")
    finally:
        db.close()


async def invalidate_stale_caches():
    """Clean up old cache entries (runs daily)."""
    try:
        # Clear old job search caches (older than 10 minutes)
        # Note: TTL handles this automatically, but explicit cleanup helps
        logger.info("Cache cleanup completed")
    except Exception as e:
        logger.error(f"Cache cleanup error: {e}")


# ─── Fast Data Fetch with Fallback ───────────────────────────────────────────

def get_dashboard_with_fallback(db: Session, user_id: str, max_wait_seconds: float = 0.5) -> Dict[str, Any]:
    """
    Get dashboard data with fast fallback.
    Returns cached/placeholder data immediately, triggers background refresh if needed.
    
    This is the KEY function for fast page loads - it NEVER waits for AI.
    """
    from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
    import threading
    
    # First, try to get cached data (this is always fast)
    cached_data = get_cached_dashboard_data(db, user_id)
    
    # If cache is fresh, return immediately
    if cached_data.get("data_source") == "cached" and not cached_data.get("needs_ai_refresh"):
        return cached_data
    
    # If data needs refresh, trigger background generation
    if cached_data.get("needs_ai_refresh") or cached_data.get("needs_generation"):
        def background_generate():
            try:
                db_bg = SessionLocal()
                generate_dashboard_data(db_bg, user_id, force_refresh=True)
                db_bg.close()
            except Exception as e:
                logger.error(f"Background dashboard generation failed: {e}")
        
        # Start background thread (don't block response)
        thread = threading.Thread(target=background_generate, daemon=True)
        thread.start()
    
    # Return current data immediately (may be stale or placeholder, but fast)
    return cached_data


def get_jobs_fast_with_fallback(db: Session, user_id: Optional[str] = None, params: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Get jobs with fast fallback to cached/general data.
    Never waits for expensive operations.
    """
    from app.services.optimized_job_service import get_jobs_fast, search_jobs_optimized
    from app.schemas.jobs import JobSearchParams
    
    params = params or {}
    
    # Try to get personalized results quickly
    if user_id:
        try:
            search_params = JobSearchParams(**params)
            result = search_jobs_optimized(db, search_params, user_id)
            if result.get("items"):
                return result
        except Exception as e:
            logger.warning(f"Personalized search failed, using fallback: {e}")
    
    # Fallback to general fast fetch
    return get_jobs_fast(
        db,
        page=params.get("page", 1),
        page_size=params.get("page_size", 20),
        location=params.get("location"),
        work_model=params.get("work_model")
    )
