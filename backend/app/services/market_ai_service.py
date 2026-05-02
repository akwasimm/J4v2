"""
Advanced Market Insights AI Service with Web Search
Uses Perplexity AI (with built-in web search) to get real-time salary and job market data.
Falls back to Groq if Perplexity is not configured.
"""

import logging
import os
import json
from typing import Dict, Any, Optional
from datetime import datetime
import requests

from app.services.groq_service import call_groq_json

logger = logging.getLogger(__name__)

# Perplexity API Configuration
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY", "")
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

# Currency conversion rates (approximate - updated periodically)
CURRENCY_RATES = {
    "USD": 83.5,  # 1 USD = 83.5 INR
    "GBP": 107.0,
    "EUR": 91.0,
    "SGD": 62.0,
    "AUD": 55.0,
    "CAD": 61.0,
    "AED": 22.7,
    "INR": 1.0,
}

# Location to currency mapping
LOCATION_CURRENCY = {
    "usa": "USD", "united states": "USD", "us": "USD", "america": "USD",
    "uk": "GBP", "united kingdom": "GBP", "britain": "GBP", "england": "GBP", "london": "GBP",
    "europe": "EUR", "germany": "EUR", "france": "EUR", "netherlands": "EUR",
    "singapore": "SGD",
    "australia": "AUD",
    "canada": "CAD",
    "uae": "AED", "dubai": "AED",
    "india": "INR",
}

# Default location currency
DEFAULT_CURRENCY = "USD"


def get_currency_for_location(location: str) -> str:
    """Determine currency based on location string."""
    location_lower = location.lower()
    for loc_key, currency in LOCATION_CURRENCY.items():
        if loc_key in location_lower:
            return currency
    return DEFAULT_CURRENCY


def convert_to_inr(amount: float, from_currency: str) -> float:
    """Convert amount to INR."""
    rate = CURRENCY_RATES.get(from_currency, CURRENCY_RATES["USD"])
    return round(amount * rate, 0)


def convert_from_inr(amount_inr: float, to_currency: str) -> float:
    """Convert INR amount to target currency."""
    if to_currency == "INR":
        return amount_inr
    rate = CURRENCY_RATES.get(to_currency, CURRENCY_RATES["USD"])
    return round(amount_inr / rate, 0)


def call_perplexity_with_search(
    prompt: str,
    system_prompt: str = "You are a helpful AI assistant with access to real-time web search.",
    temperature: float = 0.2,
    max_tokens: int = 4000
) -> Optional[str]:
    """
    Call Perplexity API with web search enabled.
    Perplexity has built-in web search capabilities.
    """
    if not PERPLEXITY_API_KEY:
        logger.warning("Perplexity API key not configured")
        return None
    
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Use sonar-pro model which has web search
    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
        "return_citations": True,
        "search_recency_filter": "month"  # Recent data only
    }
    
    try:
        response = requests.post(
            PERPLEXITY_API_URL,
            headers=headers,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        
        content = result["choices"][0]["message"]["content"]
        citations = result.get("citations", [])
        
        logger.info(f"Perplexity call successful. Citations: {len(citations)}")
        return content
        
    except Exception as e:
        logger.error(f"Perplexity API call failed: {e}")
        return None


def generate_market_search_prompt(role: str, location: str) -> str:
    """Generate search prompt for market data."""
    return f"""Search for current {role} salary data and job market trends in {location}.

I need REAL, CURRENT data from 2024-2025:
1. What is the typical salary range (min, median, max) for a {role} in {location}?
2. What is the current hiring demand - is it growing or declining?
3. Which are the top 5-8 companies currently hiring for this role?
4. What are the most in-demand skills for this position?
5. What is the experience level distribution for this role?

Provide data in this format:
- Salary figures in local currency (annual)
- Growth percentage (MoM or YoY)
- Number of active job listings if available
- Average time to hire

Be specific with real numbers based on current job market data."""


def generate_structuring_prompt(raw_data: str, role: str, location: str, currency: str) -> str:
    """Generate prompt to structure raw web data into JSON."""
    return f"""Structure this market research data into JSON format.

RAW DATA:
{raw_data}

TARGET ROLE: {role}
LOCATION: {location}
CURRENCY: {currency}

Return this exact JSON structure:
{{
    "salary": {{
        "currency": "{currency}",
        "min_annual": <integer>,
        "median_annual": <integer>,
        "max_annual": <integer>,
        "percentile_25": <integer>,
        "percentile_75": <integer>
    }},
    "trend": {{
        "growth_percentage": <decimal like 8.5>,
        "active_listings": <integer or "N/A">,
        "avg_time_to_hire_days": <integer>,
        "market_sentiment": "<hot|warm|neutral|cool>",
        "demand_level": "<high|medium|low>"
    }},
    "skills_in_demand": [
        {{
            "skill": "<skill name>",
            "demand_score": <0.0 to 1.0>,
            "salary_impact": "<positive|neutral|negative>",
            "trend": "<rising|stable|declining>"
        }}
    ],
    "top_hiring_companies": [
        {{
            "company_name": "<name>",
            "active_openings": <integer>,
            "company_type": "<Tech|Startup|Enterprise|MNC|Agency>",
            "hiring_velocity": "<fast|moderate|slow>"
        }}
    ],
    "experience_distribution": [
        {{
            "level": "Entry (0-2 yrs)",
            "percentage": <0-100>,
            "avg_salary": <integer>
        }},
        {{
            "level": "Junior (2-4 yrs)",
            "percentage": <0-100>,
            "avg_salary": <integer>
        }},
        {{
            "level": "Mid (4-7 yrs)",
            "percentage": <0-100>,
            "avg_salary": <integer>
        }},
        {{
            "level": "Senior (7-10 yrs)",
            "percentage": <0-100>,
            "avg_salary": <integer>
        }},
        {{
            "level": "Lead/Principal (10+ yrs)",
            "percentage": <0-100>,
            "avg_salary": <integer>
        }}
    ],
    "geographic_distribution": [
        {{
            "country": "<country name>",
            "percentage": <0-100>,
            "opportunity_score": <1-10>
        }}
    ],
    "salary_trends_3yr": [
        {{
            "period": "2022 Q1",
            "median_salary": <integer>,
            "market_index": <100 = baseline>
        }},
        {{
            "period": "2022 Q3",
            "median_salary": <integer>,
            "market_index": <number>
        }},
        {{
            "period": "2023 Q1",
            "median_salary": <integer>,
            "market_index": <number>
        }},
        {{
            "period": "2023 Q3",
            "median_salary": <integer>,
            "market_index": <number>
        }},
        {{
            "period": "2024 Q1",
            "median_salary": <integer>,
            "market_index": <number>
        }},
        {{
            "period": "2024 Q3",
            "median_salary": <integer>,
            "market_index": <number>
        }},
        {{
            "period": "2025 Current",
            "median_salary": <integer>,
            "market_index": <number>
        }}
    ],
    "market_summary": "<2-3 sentence summary of current market conditions>",
    "sources": ["<list of data sources if mentioned>"]
}}

Rules:
1. Use {currency} for all salary figures
2. If data is missing, use realistic estimates based on industry standards
3. experience_distribution percentages must sum to 100
4. geographic_distribution should show top 6 countries for this role
5. Make salary_trends_3yr show realistic market fluctuation
6. If raw data mentions specific companies, use those names exactly"""


def get_real_time_market_insights(
    role: str,
    location: str,
    convert_to_rupees: bool = False
) -> Dict[str, Any]:
    """
    Get real-time market insights using web search + AI.
    
    Args:
        role: Job role title
        location: Location (city, country, or region)
        convert_to_rupees: If True, also include INR converted values
        
    Returns:
        Structured market insights with real web data
    """
    logger.info(f"Fetching real-time insights for {role} in {location}")
    
    # Determine local currency
    local_currency = get_currency_for_location(location)
    
    # Step 1: Try to get real data via Perplexity (web search)
    search_prompt = generate_market_search_prompt(role, location)
    raw_data = None
    
    # Try Perplexity first (has built-in web search)
    if PERPLEXITY_API_KEY:
        raw_data = call_perplexity_with_search(
            prompt=search_prompt,
            system_prompt="You are a job market research analyst with access to real-time web search. Provide specific, data-driven answers with actual numbers.",
            temperature=0.3,
            max_tokens=3000
        )
    
    # Fallback: Use Groq without web search (simulated realistic data)
    if not raw_data:
        logger.info("Using Groq fallback for market insights")
        fallback_prompt = f"""Generate realistic market data for {role} in {location}.

Research and provide realistic 2024-2025 market data:
- Salary ranges in {local_currency}
- Current hiring trends
- Top companies hiring
- In-demand skills
- Experience level distribution

Make it detailed and realistic based on your knowledge of the tech industry."""
        
        raw_data = call_groq_json(
            prompt=fallback_prompt,
            system_prompt="You are a tech industry analyst. Provide realistic, well-researched market data.",
            model="groq/compound-mini",  # 70K tokens/min, no daily limit
            temperature=0.3,
            max_tokens=2500
        )
        if raw_data:
            raw_data = json.dumps(raw_data) if isinstance(raw_data, dict) else str(raw_data)
    
    if not raw_data:
        raise Exception("Failed to generate market insights - AI services unavailable")
    
    # Step 2: Structure the data with Groq
    structuring_prompt = generate_structuring_prompt(raw_data, role, location, local_currency)
    
    structured_data = call_groq_json(
        prompt=structuring_prompt,
        system_prompt="You are a data structuring specialist. Convert unstructured market research into clean, valid JSON.",
        model="groq/compound-mini",  # 70K tokens/min, no daily limit
        temperature=0.1,
        max_tokens=3000
    )
    
    if not structured_data:
        raise Exception("Failed to structure market insights data")
    
    # Step 3: Add INR conversions if requested
    if convert_to_rupees and local_currency != "INR":
        structured_data = add_inr_conversions(structured_data, local_currency)
    
    # Add metadata
    structured_data["_metadata"] = {
        "role": role,
        "location": location,
        "local_currency": local_currency,
        "inr_included": convert_to_rupees,
        "generated_at": datetime.utcnow().isoformat(),
        "data_source": "perplexity_web_search" if PERPLEXITY_API_KEY else "groq_ai_estimated",
        "real_time": PERPLEXITY_API_KEY is not None and len(PERPLEXITY_API_KEY) > 0
    }
    
    return structured_data


def add_inr_conversions(data: Dict[str, Any], from_currency: str) -> Dict[str, Any]:
    """Add INR converted values to salary data."""
    if from_currency == "INR":
        return data
    
    rate = CURRENCY_RATES.get(from_currency, CURRENCY_RATES["USD"])
    
    # Convert main salary
    if "salary" in data:
        salary = data["salary"]
        data["salary_inr"] = {
            "min_annual": round(salary["min_annual"] * rate, 0),
            "median_annual": round(salary["median_annual"] * rate, 0),
            "max_annual": round(salary["max_annual"] * rate, 0),
            "percentile_25": round(salary["percentile_25"] * rate, 0) if "percentile_25" in salary else None,
            "percentile_75": round(salary["percentile_75"] * rate, 0) if "percentile_75" in salary else None,
        }
    
    # Convert experience distribution salaries
    if "experience_distribution" in data:
        for exp in data["experience_distribution"]:
            if "avg_salary" in exp:
                exp["avg_salary_inr"] = round(exp["avg_salary"] * rate, 0)
    
    # Convert salary trends
    if "salary_trends_3yr" in data:
        for trend in data["salary_trends_3yr"]:
            if "median_salary" in trend:
                trend["median_salary_inr"] = round(trend["median_salary"] * rate, 0)
    
    data["conversion_rate"] = {
        "from_currency": from_currency,
        "to_inr": rate,
        "as_of": "2024-2025"
    }
    
    return data


def format_for_frontend(
    data: Dict[str, Any],
    show_inr: bool = False
) -> Dict[str, Any]:
    """
    Format the AI-generated data for the MarketInsights.jsx frontend component.
    
    Args:
        data: Raw AI-generated insights
        show_inr: If True, display values in INR instead of local currency
        
    Returns:
        Formatted data matching frontend expectations
    """
    currency = "INR" if show_inr else data.get("_metadata", {}).get("local_currency", "USD")
    
    # Determine salary source
    salary_key = "salary_inr" if show_inr and "salary_inr" in data else "salary"
    salary_data = data.get(salary_key, data.get("salary", {}))
    
    # Format salary metrics
    salary_metrics = {
        "currency": currency,
        "min": salary_data.get("min_annual", 0),
        "median": salary_data.get("median_annual", 0),
        "max": salary_data.get("max_annual", 0),
        "p25": salary_data.get("percentile_25", salary_data.get("min_annual", 0)),
        "p75": salary_data.get("percentile_75", salary_data.get("max_annual", 0)),
    }
    
    # Format trend data
    trend_data = data.get("trend", {})
    trend = {
        "growth_percentage": trend_data.get("growth_percentage", 5.0),
        "active_listings": trend_data.get("active_listings", "N/A"),
        "avg_time_to_hire": trend_data.get("avg_time_to_hire_days", 21),
        "market_sentiment": trend_data.get("market_sentiment", "warm"),
        "demand_level": trend_data.get("demand_level", "medium"),
    }
    
    # Format skills
    skills = data.get("skills_in_demand", [])
    formatted_skills = []
    for skill in skills[:8]:  # Max 8 skills
        formatted_skills.append({
            "skill": skill.get("skill", "Unknown"),
            "demand_score": skill.get("demand_score", 0.7),
            "trend": skill.get("trend", "stable"),
            "salary_impact": skill.get("salary_impact", "neutral")
        })
    
    # Format companies
    companies = data.get("top_hiring_companies", [])
    formatted_companies = []
    for company in companies[:6]:  # Max 6 companies
        formatted_companies.append({
            "company_name": company.get("company_name", "Unknown"),
            "active_openings": company.get("active_openings", 5),
            "company_type": company.get("company_type", "Tech"),
            "hiring_velocity": company.get("hiring_velocity", "moderate")
        })
    
    # Format experience distribution for chart
    exp_dist = data.get("experience_distribution", [])
    formatted_exp_dist = []
    for exp in exp_dist:
        salary_val = exp.get("avg_salary_inr" if show_inr else "avg_salary", 0)
        formatted_exp_dist.append({
            "level": exp.get("level", ""),
            "percentage": exp.get("percentage", 0),
            "avg_salary": salary_val,
            "count_estimate": int(exp.get("percentage", 0) * 10)  # Rough estimate
        })
    
    # Format geographic distribution
    geo_dist = data.get("geographic_distribution", [])
    formatted_geo = []
    for geo in geo_dist[:6]:  # Top 6 countries
        formatted_geo.append({
            "country": geo.get("country", ""),
            "percentage": geo.get("percentage", 0),
            "opportunity_score": geo.get("opportunity_score", 5)
        })
    
    # Format salary trends for chart
    trends_3yr = data.get("salary_trends_3yr", [])
    formatted_trends = []
    for t in trends_3yr:
        salary_val = t.get("median_salary_inr" if show_inr else "median_salary", 0)
        formatted_trends.append({
            "period": t.get("period", ""),
            "median_salary": salary_val,
            "market_index": t.get("market_index", 100)
        })
    
    return {
        "role": data.get("_metadata", {}).get("role"),
        "location": data.get("_metadata", {}).get("location"),
        "display_currency": currency,
        "metrics": salary_metrics,
        "trend": trend,
        "skills_in_demand": formatted_skills,
        "top_hiring_companies": formatted_companies,
        "experience_distribution": formatted_exp_dist,
        "geographic_distribution": formatted_geo,
        "salary_trends": formatted_trends,
        "market_summary": data.get("market_summary", ""),
        "sources": data.get("sources", []),
        "is_real_time": data.get("_metadata", {}).get("real_time", False),
        "generated_at": data.get("_metadata", {}).get("generated_at"),
        "inr_available": "salary_inr" in data,
    }
