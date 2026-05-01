"""
Market Data API Router
======================
Serves pre-populated market insights data from the database.
This is the primary endpoint for the Market Insights page.
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.models.ai_pages import MarketData

router = APIRouter()


@router.get("/market-insights-db")
def get_market_insights_from_db(
    role: str = Query(..., description="Job role title (e.g., 'Full Stack Developer')"),
    location: str = Query(..., description="Location (e.g., 'New York, USA' or 'Remote')"),
    show_inr: bool = Query(default=False, description="Convert all values to Indian Rupees"),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get market insights from pre-populated database.
    
    This endpoint reads from the market_data table which is populated
    by running: python scripts/populate_market_data.py
    
    - Fast response (no AI API calls)
    - Real currency based on location
    - Toggle 'show_inr' to convert all values to Rupees
    - Includes all charts and visualizations data
    """
    
    # Normalize location for lookup
    location_normalized = location.strip()
    if "global" in location_normalized.lower() or "remote" in location_normalized.lower():
        location_normalized = "Global (Remote)"
    
    # Query database
    market_record = db.query(MarketData).filter(
        MarketData.role == role,
        MarketData.location == location_normalized
    ).first()
    
    if not market_record:
        # Try fuzzy match on location (e.g., "New York" matches "New York, USA")
        market_record = db.query(MarketData).filter(
            MarketData.role == role,
            MarketData.location.ilike(f"%{location_normalized}%")
        ).first()
    
    if not market_record:
        raise HTTPException(
            status_code=404,
            detail=f"Market data not found for role='{role}' location='{location}'. "
                   f"Run: python scripts/populate_market_data.py to populate data."
        )
    
    # Determine which currency to display
    currency_symbol = "₹" if show_inr else (
        "£" if market_record.local_currency == "GBP" else
        "€" if market_record.local_currency == "EUR" else
        "$" if market_record.local_currency == "USD" else
        "₹" if market_record.local_currency == "INR" else "$"
    )
    
    # Build response with currency conversion
    response_data = {
        "display_currency": "INR" if show_inr else market_record.local_currency,
        "currency_symbol": currency_symbol,
        "inr_available": market_record.inr_available,
        
        "metrics": {
            "min": market_record.salary_min_inr if show_inr else market_record.salary_min,
            "median": market_record.salary_median_inr if show_inr else market_record.salary_median,
            "max": market_record.salary_max_inr if show_inr else market_record.salary_max,
            "currency": "INR" if show_inr else market_record.local_currency
        },
        
        "trend": {
            "growth_percentage": market_record.growth_percentage,
            "active_listings": market_record.active_listings,
            "avg_time_to_hire": market_record.avg_time_to_hire,
            "confidence": market_record.confidence_score
        },
        
        "skills_in_demand": market_record.skills_in_demand or [],
        "top_hiring_companies": market_record.top_hiring_companies or [],
        "experience_distribution": market_record.experience_distribution or [],
        "geographic_distribution": market_record.geographic_distribution or [],
        "salary_trends": market_record.salary_trends or [],
        
        "market_summary": market_record.market_summary,
        "data_source": market_record.data_source,
        "updated_at": market_record.updated_at.isoformat() if market_record.updated_at else None,
        "expires_at": market_record.expires_at.isoformat() if market_record.expires_at else None
    }
    
    return {
        "user_id": user_id,
        "role": role,
        "location": location,
        "data": response_data,
        "source": "database",
        "is_cached": True
    }


@router.get("/market-insights-db/all")
def get_all_market_data(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all available market data entries (for admin/debug)."""
    records = db.query(MarketData).all()
    
    return {
        "count": len(records),
        "combinations": [
            {
                "role": r.role,
                "location": r.location,
                "currency": r.local_currency,
                "salary_median": r.salary_median,
                "updated_at": r.updated_at.isoformat() if r.updated_at else None
            }
            for r in records
        ]
    }


@router.get("/market-insights-db/combinations")
def get_available_combinations(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get list of all available role+location combinations."""
    records = db.query(MarketData.role, MarketData.location).distinct().all()
    
    roles = sorted(set([r[0] for r in records]))
    locations = sorted(set([r[1] for r in records]))
    
    return {
        "roles": roles,
        "locations": locations,
        "total_combinations": len(records)
    }


@router.get("/market-insights-db/status")
def get_population_status(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Check status of market data population."""
    total_records = db.query(MarketData).count()
    recent_records = db.query(MarketData).filter(
        MarketData.updated_at >= datetime.now(timezone.utc) - timedelta(days=7)
    ).count()
    expired_records = db.query(MarketData).filter(
        MarketData.expires_at < datetime.now(timezone.utc)
    ).count()
    
    # Get sample data
    sample = db.query(MarketData).first()
    
    return {
        "total_records": total_records,
        "updated_last_7_days": recent_records,
        "expired_records": expired_records,
        "has_data": total_records > 0,
        "sample_available": sample is not None,
        "sample_role": sample.role if sample else None,
        "sample_location": sample.location if sample else None,
        "sample_currency": sample.local_currency if sample else None,
        "last_updated": sample.updated_at.isoformat() if sample and sample.updated_at else None
    }
