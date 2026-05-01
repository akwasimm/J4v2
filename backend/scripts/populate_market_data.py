#!/usr/bin/env python3
"""
Market Data Population Script
=============================
Populates the market_data table with AI-generated insights for all role+location combinations.

Usage:
    cd backend
    python scripts/populate_market_data.py

    # Force refresh all data
    python scripts/populate_market_data.py --force

    # Add new roles/locations
    python scripts/populate_market_data.py --roles "New Role 1,New Role 2" --locations "Paris, France,Tokyo, Japan"

Environment:
    Requires GROQ_API_KEY in .env file
"""

import os
import sys
import json
import argparse
import time
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
import logging

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.ai_pages import MarketData
from app.services.groq_service import call_groq_json
from app.services.market_ai_service import get_currency_for_location, CURRENCY_RATES

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# Rate limiter: 20 calls per minute = 1 call every 3 seconds
class RateLimiter:
    """Simple rate limiter to avoid API throttling."""
    def __init__(self, calls_per_minute: int = 20):
        self.min_interval = 60.0 / calls_per_minute  # seconds between calls
        self.last_call_time = 0
    
    def wait(self):
        """Wait if necessary to maintain rate limit."""
        elapsed = time.time() - self.last_call_time
        if elapsed < self.min_interval:
            sleep_time = self.min_interval - elapsed
            logger.debug(f"Rate limiting: sleeping {sleep_time:.2f}s")
            time.sleep(sleep_time)
        self.last_call_time = time.time()


# Global rate limiter instance - 2 calls per minute to stay within Groq free tier
rate_limiter = RateLimiter(calls_per_minute=2)


# Default roles and locations (expandable)
DEFAULT_ROLES = [
    "Senior Product Designer",
    "Full Stack Developer",
    "Marketing Manager",
    "Data Scientist",
    "UX Researcher",
    "DevOps Engineer",
    "Product Manager",
    "Software Architect"
]

DEFAULT_LOCATIONS = [
    "Global (Remote)",
    "New York, USA",
    "London, UK",
    "Singapore",
    "San Francisco, USA",
    "Berlin, Germany",
    "Toronto, Canada",
    "Sydney, Australia",
    "Dubai, UAE",
    "Bangalore, India",
    "Mumbai, India",
    "Delhi, India",
    "Hyderabad, India",
    "Chennai, India",
    "Pune, India"
]


def convert_to_inr(amount: float, from_currency: str) -> int:
    """Convert amount to INR."""
    if from_currency == "INR":
        return int(amount)
    rate = CURRENCY_RATES.get(from_currency, CURRENCY_RATES["USD"])
    return int(round(amount * rate, 0))


def generate_groq_prompt(role: str, location: str, currency: str) -> str:
    """Generate prompt for Groq AI."""
    
    # Handle remote/global locations
    if "remote" in location.lower() or "global" in location.lower():
        location_context = "Global Remote positions"
        salary_context = f"USD (typical for remote work)"
    else:
        location_context = location
        salary_context = f"{currency} (local market rate for {location})"
    
    return f"""Generate comprehensive job market insights for:

ROLE: {role}
LOCATION: {location_context}
CURRENCY: {salary_context}

Return this exact JSON structure:
{{
    "market_summary": "Brief 2-3 sentence summary of current market conditions",
    "salary_data": {{
        "min": <integer - minimum annual salary in {currency}>,
        "median": <integer - median annual salary in {currency}>,
        "max": <integer - maximum annual salary in {currency}>,
        "currency": "{currency}"
    }},
    "trend": {{
        "growth_percentage": <decimal like 8.5>,
        "active_listings": <integer - approximate current openings>,
        "avg_time_to_hire": <integer - days from application to offer>,
        "confidence": <decimal 0.0-1.0 indicating data confidence>
    }},
    "skills_in_demand": [
        {{
            "skill": "Skill Name",
            "demand_score": <0.0 to 1.0>,
            "trend": "rising|stable|declining"
        }}
    ],
    "top_hiring_companies": [
        {{
            "company_name": "Company Name",
            "active_openings": <integer>,
            "hiring_velocity": "fast|moderate|slow"
        }}
    ],
    "experience_distribution": [
        {{
            "level": "Entry (0-2 yrs)",
            "percentage": <integer>,
            "avg_salary": <integer in {currency}>
        }},
        {{
            "level": "Junior (2-4 yrs)",
            "percentage": <integer>,
            "avg_salary": <integer in {currency}>
        }},
        {{
            "level": "Mid (4-7 yrs)",
            "percentage": <integer>,
            "avg_salary": <integer in {currency}>
        }},
        {{
            "level": "Senior (7-10 yrs)",
            "percentage": <integer>,
            "avg_salary": <integer in {currency}>
        }},
        {{
            "level": "Lead (10+ yrs)",
            "percentage": <integer>,
            "avg_salary": <integer in {currency}>
        }}
    ],
    "geographic_distribution": [
        {{
            "country": "Country Name",
            "percentage": <integer>
        }}
    ],
    "salary_trends": [
        {{
            "period": "2022 Q1",
            "median_salary": <integer>,
            "median_salary_inr": <integer - converted to INR>
        }},
        {{
            "period": "2023 Q1",
            "median_salary": <integer>,
            "median_salary_inr": <integer>
        }},
        {{
            "period": "2024 Q1",
            "median_salary": <integer>,
            "median_salary_inr": <integer>
        }},
        {{
            "period": "2025 Q1",
            "median_salary": <integer>,
            "median_salary_inr": <integer>
        }}
    ]
}}

Important Rules:
1. Salary data must be realistic for {location} market in 2024-2025
2. Skills should be 6-8 most relevant to {role}
3. Companies should be real companies hiring for {role} in {location}
4. Experience distribution percentages must add up to 100
5. Geographic distribution should reflect where {role} jobs are concentrated
6. Salary trends should show realistic growth from 2022-2025
7. All salaries in {currency}, but include INR conversion
8. For remote/global roles, use USD and include global distribution
"""


def call_groq_for_market_data(role: str, location: str, max_retries: int = 2) -> Dict[str, Any]:
    """Call Groq AI to get market data for a role+location (with rate limiting and retry)."""
    
    currency = get_currency_for_location(location)
    prompt = generate_groq_prompt(role, location, currency)
    
    logger.info(f"Fetching data for: {role} @ {location} ({currency})")
    
    for attempt in range(max_retries + 1):
        # Apply rate limiting before API call
        rate_limiter.wait()
        
        try:
            result = call_groq_json(
                prompt=prompt,
                system_prompt="You are an expert job market analyst with deep knowledge of global salary data and hiring trends. Provide accurate, current market data.",
                temperature=0.2,
                max_tokens=4000
            )
            
            if result:
                return result
            
            if attempt < max_retries:
                logger.warning(f"Empty result, retrying ({attempt + 1}/{max_retries})...")
                time.sleep(2)  # Brief pause before retry
            else:
                logger.error(f"No response from Groq for {role} @ {location} after {max_retries} retries")
                return None
                
        except Exception as e:
            if attempt < max_retries:
                logger.warning(f"Error: {e}, retrying ({attempt + 1}/{max_retries})...")
                time.sleep(2)
            else:
                logger.error(f"Error calling Groq for {role} @ {location}: {e}")
                return None
    
    return None


def save_market_data(db: Session, role: str, location: str, data: Dict[str, Any], force: bool = False) -> MarketData:
    """Save or update market data in database."""
    
    # Check if record exists
    existing = db.query(MarketData).filter(
        MarketData.role == role,
        MarketData.location == location
    ).first()
    
    if existing and not force:
        logger.info(f"Skipping {role} @ {location} (already exists, use --force to update)")
        return existing
    
    currency = data.get("salary_data", {}).get("currency", get_currency_for_location(location))
    salary_data = data.get("salary_data", {})
    trend = data.get("trend", {})
    
    # Calculate INR values if not remote
    is_remote = "remote" in location.lower() or "global" in location.lower()
    inr_available = True
    
    salary_min = salary_data.get("min", 0)
    salary_median = salary_data.get("median", 0)
    salary_max = salary_data.get("max", 0)
    
    salary_min_inr = convert_to_inr(salary_min, currency) if not is_remote else salary_min * 83
    salary_median_inr = convert_to_inr(salary_median, currency) if not is_remote else salary_median * 83
    salary_max_inr = convert_to_inr(salary_max, currency) if not is_remote else salary_max * 83
    
    # Process salary trends to ensure INR values
    salary_trends = data.get("salary_trends", [])
    for trend_item in salary_trends:
        median = trend_item.get("median_salary", 0)
        if "median_salary_inr" not in trend_item or trend_item["median_salary_inr"] == 0:
            trend_item["median_salary_inr"] = convert_to_inr(median, currency) if not is_remote else median * 83
    
    market_record = MarketData(
        role=role,
        location=location,
        location_type="remote" if is_remote else "onsite",
        local_currency=currency,
        inr_available=inr_available,
        
        salary_min=salary_min,
        salary_median=salary_median,
        salary_max=salary_max,
        salary_min_inr=salary_min_inr,
        salary_median_inr=salary_median_inr,
        salary_max_inr=salary_max_inr,
        
        growth_percentage=trend.get("growth_percentage", 0),
        active_listings=trend.get("active_listings", 0),
        avg_time_to_hire=trend.get("avg_time_to_hire", 30),
        
        skills_in_demand=data.get("skills_in_demand", []),
        top_hiring_companies=data.get("top_hiring_companies", []),
        experience_distribution=data.get("experience_distribution", []),
        geographic_distribution=data.get("geographic_distribution", []),
        salary_trends=salary_trends,
        
        market_summary=data.get("market_summary", ""),
        data_source="groq",
        confidence_score=trend.get("confidence", 0.8),
        
        updated_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)  # Refresh monthly
    )
    
    if existing:
        # Update existing record
        existing.location_type = market_record.location_type
        existing.local_currency = market_record.local_currency
        existing.inr_available = market_record.inr_available
        existing.salary_min = market_record.salary_min
        existing.salary_median = market_record.salary_median
        existing.salary_max = market_record.salary_max
        existing.salary_min_inr = market_record.salary_min_inr
        existing.salary_median_inr = market_record.salary_median_inr
        existing.salary_max_inr = market_record.salary_max_inr
        existing.growth_percentage = market_record.growth_percentage
        existing.active_listings = market_record.active_listings
        existing.avg_time_to_hire = market_record.avg_time_to_hire
        existing.skills_in_demand = market_record.skills_in_demand
        existing.top_hiring_companies = market_record.top_hiring_companies
        existing.experience_distribution = market_record.experience_distribution
        existing.geographic_distribution = market_record.geographic_distribution
        existing.salary_trends = market_record.salary_trends
        existing.market_summary = market_record.market_summary
        existing.confidence_score = market_record.confidence_score
        existing.updated_at = market_record.updated_at
        existing.expires_at = market_record.expires_at
        
        db.commit()
        logger.info(f"Updated {role} @ {location}")
        return existing
    else:
        # Create new record
        db.add(market_record)
        db.commit()
        db.refresh(market_record)
        logger.info(f"Created {role} @ {location}")
        return market_record


def populate_all_combinations(roles: List[str], locations: List[str], force: bool = False):
    """Populate market data for all role+location combinations."""
    
    db = SessionLocal()
    total = len(roles) * len(locations)
    success = 0
    failed = 0
    skipped = 0
    
    logger.info(f"Starting population: {len(roles)} roles x {len(locations)} locations = {total} combinations")
    logger.info(f"Force update: {force}")
    logger.info(f"Rate limit: 2 calls/minute (approx {total * 30 // 60} minutes estimated)")
    
    start_time = time.time()
    
    for i, role in enumerate(roles, 1):
        for j, location in enumerate(locations, 1):
            current = (i - 1) * len(locations) + j
            logger.info(f"[{current}/{total}] Processing: {role} @ {location}")
            
            # Check if exists and not forcing
            if not force:
                existing = db.query(MarketData).filter(
                    MarketData.role == role,
                    MarketData.location == location
                ).first()
                if existing:
                    logger.info(f"  -> Skipped (exists)")
                    skipped += 1
                    continue
            
            # Fetch from Groq
            data = call_groq_for_market_data(role, location)
            
            if data:
                try:
                    save_market_data(db, role, location, data, force)
                    success += 1
                except Exception as e:
                    logger.error(f"  -> Failed to save: {e}")
                    failed += 1
            else:
                logger.error(f"  -> Failed to fetch")
                failed += 1
    
    db.close()
    
    elapsed = time.time() - start_time
    minutes = int(elapsed // 60)
    seconds = int(elapsed % 60)
    
    logger.info("=" * 60)
    logger.info("Population Complete!")
    logger.info(f"Total combinations: {total}")
    logger.info(f"Successful: {success}")
    logger.info(f"Skipped: {skipped}")
    logger.info(f"Failed: {failed}")
    logger.info(f"Time elapsed: {minutes}m {seconds}s")
    logger.info(f"Rate: {success / (elapsed / 60):.1f} calls/minute")
    logger.info("=" * 60)


def main():
    parser = argparse.ArgumentParser(description="Populate market data for job roles and locations")
    parser.add_argument("--force", action="store_true", help="Force update existing records")
    parser.add_argument("--roles", type=str, help="Comma-separated list of additional roles")
    parser.add_argument("--locations", type=str, help="Comma-separated list of additional locations")
    parser.add_argument("--list", action="store_true", help="List current roles and locations")
    
    args = parser.parse_args()
    
    # Build role and location lists
    roles = DEFAULT_ROLES.copy()
    locations = DEFAULT_LOCATIONS.copy()
    
    if args.roles:
        additional_roles = [r.strip() for r in args.roles.split(",")]
        roles.extend(additional_roles)
        logger.info(f"Added {len(additional_roles)} custom roles")
    
    if args.locations:
        additional_locations = [l.strip() for l in args.locations.split(",")]
        locations.extend(additional_locations)
        logger.info(f"Added {len(additional_locations)} custom locations")
    
    if args.list:
        print("\nRoles:")
        for i, role in enumerate(roles, 1):
            print(f"  {i}. {role}")
        print(f"\nLocations:")
        for i, loc in enumerate(locations, 1):
            print(f"  {i}. {loc}")
        return
    
    # Validate GROQ_API_KEY
    if not os.getenv("GROQ_API_KEY"):
        logger.error("GROQ_API_KEY not found in environment variables!")
        logger.error("Please set it in your .env file or environment.")
        sys.exit(1)
    
    logger.info(f"Using {len(roles)} roles and {len(locations)} locations")
    
    # Run population
    populate_all_combinations(roles, locations, force=args.force)


if __name__ == "__main__":
    main()
