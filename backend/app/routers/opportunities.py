"""
Opportunities Router - Big Opportunities page endpoints.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user_id, require_groq
from app.schemas.common import SuccessResponse

router = APIRouter()


@router.get("/")
def get_opportunities(
    category: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Get opportunities data (public endpoint).
    If category is specified, returns data for that category only.
    If no category, returns all categories.
    """
    from app.services.opportunities_service import get_opportunities
    return get_opportunities(db, category)


@router.post("/refresh")
def refresh_opportunities(
    category: Optional[str] = Query(default=None),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    _: str = Depends(require_groq)
):
    """
    Refresh opportunities data using AI.
    If category is specified, refreshes only that category.
    If no category, refreshes all categories.
    Requires GROQ API key.
    """
    from app.services.opportunities_service import refresh_opportunities, refresh_all_opportunities
    
    if category:
        return refresh_opportunities(db, category)
    else:
        return refresh_all_opportunities(db)


@router.get("/status")
def get_opportunities_status(
    db: Session = Depends(get_db)
):
    """
    Get status of all opportunity caches (last updated, expiry).
    """
    from app.models.ai_pages import BigOpportunities
    from datetime import datetime, timezone
    
    caches = db.query(BigOpportunities).all()
    
    status = {}
    for cache in caches:
        is_expired = cache.expires_at and cache.expires_at < datetime.now(timezone.utc)
        status[cache.category] = {
            "generated_at": cache.generated_at.isoformat(),
            "expires_at": cache.expires_at.isoformat() if cache.expires_at else None,
            "is_expired": is_expired,
            "entries_count": len(cache.data_json) if cache.data_json else 0
        }
    
    return {
        "categories": status,
        "checked_at": datetime.now(timezone.utc).isoformat()
    }
