"""
Opportunities Service - Manages Big Opportunities page data.
Fetches real job data from Indian service companies using AI, caches weekly.
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

from app.models.ai_pages import BigOpportunities
from app.services.groq_service import call_groq_json

logger = logging.getLogger(__name__)

# Indian companies to track for opportunities
INDIAN_COMPANIES = {
    "mass_hiring": [
        "Tata Consultancy Services (TCS)",
        "Wipro",
        "Infosys",
        "HCL Technologies",
        "L&T Infotech",
        "Tech Mahindra",
        "Mphasis",
        "Cognizant India"
    ],
    "product_companies": [
        "Zomato",
        "Swiggy",
        "Razorpay",
        "Freshworks",
        "PhonePe",
        "CRED",
        "Flipkart",
        "Paytm",
        "BYJU'S",
        "OYO"
    ],
    "mnc_roles": [
        "Google India",
        "Amazon India",
        "Microsoft India",
        "Meta India",
        "Apple India",
        "Adobe India",
        "Salesforce India",
        "Uber India"
    ]
}

CATEGORIES = ["mass_hiring", "product_companies", "mnc_roles", "campus_drives"]


def get_cached_opportunities(db: Session, category: str) -> Optional[Dict[str, Any]]:
    """Get cached opportunities data if still valid."""
    cached = db.query(BigOpportunities).filter(
        BigOpportunities.category == category
    ).order_by(BigOpportunities.generated_at.desc()).first()
    
    if not cached:
        return None
    
    # Check if cache is still valid (7 days)
    if cached.expires_at and cached.expires_at > datetime.now(timezone.utc):
        logger.info(f"Cache hit for opportunities category={category}")
        return {
            "category": category,
            "data": cached.data_json,
            "generated_at": cached.generated_at.isoformat(),
            "expires_at": cached.expires_at.isoformat()
        }
    
    return None


def generate_opportunities_prompt(category: str) -> str:
    """Generate AI prompt for fetching opportunities data."""
    
    if category == "mass_hiring":
        companies = ", ".join(INDIAN_COMPANIES["mass_hiring"])
        return f"""
You are analyzing mass hiring drives from Indian IT service companies.
Companies to analyze: {companies}

For each company, provide:
1. Company name
2. Number of open positions (estimate based on typical bulk hiring)
3. Key roles being hired (e.g., Junior Associate, System Engineer, Developer)
4. Locations (Indian cities)
5. Brief description of the hiring drive
6. Badge text (e.g., "200+ Openings")

Return JSON array with structure:
[
  {{
    "title": "Company Name",
    "badge": "X+ Openings",
    "desc": "Brief description of hiring drive and roles",
    "bg": "bg-blue-50",
    "iconColor": "text-blue-600",
    "icon": "domain"
  }}
]

Use these icon values: domain, dns, terminal, business, corporate_fare
Use these bg values: bg-blue-50, bg-green-50, bg-purple-50, bg-orange-50
Use these iconColor values: text-blue-600, text-green-600, text-purple-600, text-orange-600
"""

    elif category == "product_companies":
        companies = ", ".join(INDIAN_COMPANIES["product_companies"])
        return f"""
You are analyzing job opportunities at Indian product companies/unicorns.
Companies to analyze: {companies}

For each company, provide:
1. Company name
2. Icon representing their industry
3. Background color
4. Text color

Return JSON array with structure:
[
  {{
    "icon": "appropriate_icon",
    "label": "Company Name",
    "bg": "bg-color",
    "color": "text-color"
  }}
]

Use these icon values: payments, credit_card, local_shipping, monitoring, rocket_launch, restaurant, shopping_bag, flight, hotel, school
Use these bg values: bg-blue-100, bg-pink-100, bg-yellow-100, bg-green-100, bg-purple-100, bg-orange-100, bg-red-100
Use these color values: text-blue-600, text-pink-600, text-yellow-600, text-green-600, text-purple-600, text-orange-600, text-red-600
"""

    elif category == "mnc_roles":
        companies = ", ".join(INDIAN_COMPANIES["mnc_roles"])
        return f"""
You are analyzing high-paying roles at MNCs in India.
Companies to analyze: {companies}

For each role, provide:
1. Job title
2. Company name
3. Location in India
4. Salary range in INR (annual, in lakhs, e.g., "₹140k - ₹220k" for 14-22 LPA)
5. Tags (work type, level)
6. Icon representing the role
7. Icon background color
8. Icon color

Return JSON array with structure:
[
  {{
    "title": "Job Title",
    "company": "Company Name",
    "location": "City, IN",
    "salary": "₹Xk - ₹Yk",
    "tags": [
      {{"label": "Hybrid/Remote/On-site", "bg": "bg-color"}},
      {{"label": "Level", "bg": "bg-gray-100"}}
    ],
    "iconBg": "bg-color",
    "icon": "icon_name",
    "iconColor": "text-color"
  }}
]

Use these icon values: search, shopping_cart, window, code, storage, cloud, psychology, dashboard
Use these iconBg values: bg-gray-100, bg-orange-50, bg-blue-50, bg-green-50, bg-purple-50
Use these iconColor values: text-gray-800, text-orange-600, text-blue-700, text-green-600, text-purple-600
Use these tag bg values: bg-blue-100, bg-green-100, bg-purple-100, bg-orange-100
"""

    elif category == "campus_drives":
        return f"""
You are analyzing upcoming campus drives and fresher hiring events in India.

For each drive, provide:
1. Month (abbreviated, e.g., "Oct")
2. Day (date number)
3. Title of the drive
4. Location (Virtual or specific city)
5. Application deadline
6. Date badge background color
7. Date text color

Return JSON array with structure:
[
  {{
    "month": "Oct",
    "day": "24",
    "title": "Drive Name",
    "location": "Location",
    "deadline": "Oct 20, 2026",
    "dateBg": "bg-yellow-400",
    "dateText": "text-black"
  }}
]

Use these dateBg values: bg-yellow-400, bg-[#1A4D2E], bg-orange-400, bg-blue-400, bg-purple-400
Use these dateText values: text-black, text-white
"""

    return ""


def fetch_opportunities_from_ai(category: str) -> List[Dict[str, Any]]:
    """Fetch opportunities data using AI."""
    prompt = generate_opportunities_prompt(category)
    
    try:
        result = call_groq_json(
            prompt=prompt,
            system_prompt="You are a job market analyst specializing in Indian IT companies. Return only valid JSON arrays."
        )
        
        if isinstance(result, list):
            return result
        elif isinstance(result, dict):
            # Try to extract data from various possible structures
            # Category-specific keys
            if category == "product_companies" and "companies" in result:
                return result["companies"]
            elif category == "mnc_roles" and "roles" in result:
                return result["roles"]
            elif category == "campus_drives" and "drives" in result:
                return result["drives"]
            # Generic keys
            elif "data" in result:
                return result["data"]
            elif "opportunities" in result:
                return result["opportunities"]
            elif "items" in result:
                return result["items"]
            else:
                # If it's a dict but no known key, log and return empty
                logger.error(f"Unexpected AI response format for category={category}: {list(result.keys())}")
                return []
        else:
            logger.error(f"Unexpected AI response format for category={category}: {type(result)}")
            return []
            
    except Exception as e:
        logger.error(f"Failed to fetch opportunities for category={category}: {e}")
        return []


def refresh_opportunities(db: Session, category: str) -> Dict[str, Any]:
    """Refresh opportunities data for a category using AI."""
    logger.info(f"Refreshing opportunities for category={category}")
    
    # Fetch new data from AI
    data = fetch_opportunities_from_ai(category)
    
    if not data:
        logger.warning(f"No data returned from AI for category={category}")
        return {
            "success": False,
            "error": "Failed to fetch data from AI",
            "category": category
        }
    
    # Calculate expiry (7 days from now, next Sunday 6 AM IST)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=7)
    
    # Delete old cache for this category
    db.query(BigOpportunities).filter(
        BigOpportunities.category == category
    ).delete()
    
    # Create new cache entry
    new_entry = BigOpportunities(
        category=category,
        data_json=data,
        generated_at=now,
        expires_at=expires_at
    )
    
    db.add(new_entry)
    db.commit()
    
    logger.info(f"Successfully refreshed opportunities for category={category}, {len(data)} entries")
    
    return {
        "success": True,
        "category": category,
        "entries_count": len(data),
        "generated_at": now.isoformat(),
        "expires_at": expires_at.isoformat()
    }


def refresh_all_opportunities(db: Session) -> Dict[str, Any]:
    """Refresh all opportunity categories."""
    results = {}
    
    for category in CATEGORIES:
        result = refresh_opportunities(db, category)
        results[category] = result
    
    return {
        "success": True,
        "results": results,
        "refreshed_at": datetime.now(timezone.utc).isoformat()
    }


def get_opportunities(db: Session, category: Optional[str] = None) -> Dict[str, Any]:
    """Get opportunities data, fetching from AI if cache expired."""
    
    if category:
        # Single category
        cached = get_cached_opportunities(db, category)
        
        if cached:
            return cached
        
        # Cache expired or doesn't exist, refresh
        result = refresh_opportunities(db, category)
        
        if result["success"]:
            return get_cached_opportunities(db, category)
        else:
            return {
                "category": category,
                "data": [],
                "error": "Failed to fetch opportunities"
            }
    else:
        # All categories
        all_data = {}
        
        for cat in CATEGORIES:
            cached = get_cached_opportunities(db, cat)
            
            if cached:
                all_data[cat] = cached
            else:
                # Refresh expired category
                result = refresh_opportunities(db, cat)
                if result["success"]:
                    cached = get_cached_opportunities(db, cat)
                    all_data[cat] = cached
                else:
                    all_data[cat] = {
                        "category": cat,
                        "data": [],
                        "error": "Failed to fetch"
                    }
        
        return {
            "categories": all_data,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
