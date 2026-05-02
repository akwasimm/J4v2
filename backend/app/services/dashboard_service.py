"""
Dashboard Service - Generates personalized dashboard data using Groq AI.
Caches results for 6 hours. Shows market trends for incomplete profiles.
"""

import logging
import random
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy import func


def get_user_stats(db: Session, user_id: str) -> dict:
    """
    Get user activity statistics safely.
    Returns dict with user stats for dashboard display.
    """
    stats = {
        "total_applications": 0,
        "saved_jobs": 0,
        "profile_views": 0,
        "interviews_scheduled": 0,
        "offers_received": 0,
        "active_applications": 0,
        "last_activity": None,
        "member_since": None,
        "application_success_rate": 0,
        "first_name": None,
        "full_name": None,
        "profile_completion": 0,
    }
    
    try:
        # Get user info
        from app.models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            stats["first_name"] = getattr(user, 'first_name', None)
            stats["full_name"] = getattr(user, 'full_name', None)
            stats["profile_completion"] = getattr(user, 'profile_completion', 0) or 0
            
            created_at = getattr(user, 'created_at', None)
            if created_at:
                stats["member_since"] = created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)
            
            updated_at = getattr(user, 'updated_at', None)
            if updated_at:
                stats["last_activity"] = updated_at.isoformat() if hasattr(updated_at, 'isoformat') else str(updated_at)
    except Exception as e:
        logger.warning(f"Could not get user info: {e}")
    
    try:
        # Get application count
        from app.models.application import JobApplication
        total_apps = db.query(func.count(JobApplication.id)).filter(
            JobApplication.user_id == user_id
        ).scalar() or 0
        stats["total_applications"] = total_apps
    except Exception as e:
        logger.warning(f"Could not get application stats: {e}")
    
    try:
        # Get saved jobs count
        from app.models.saved_job import SavedJob
        saved = db.query(func.count(SavedJob.id)).filter(
            SavedJob.user_id == user_id
        ).scalar() or 0
        stats["saved_jobs"] = saved
    except Exception as e:
        logger.warning(f"Could not get saved jobs: {e}")
    
    return stats


def get_fallback_top_picks() -> list:
    """Fallback top picks when AI is unavailable"""
    return [
        {
            "job_id": "fallback_001",
            "title": "Senior Software Developer",
            "company": "TechCorp India",
            "location": "Bangalore",
            "work_model": "hybrid",
            "match_score": 95,
            "salary_range": "₹15L - ₹25L",
            "tags": ["JavaScript", "React", "Node.js"],
            "match_reasons": ["High demand for your skill set", "Matches your experience level"],
            "cardBg": "#E6F6D4",
            "matchBg": "#D8B4FE",
            "matchColor": "#000000"
        },
        {
            "job_id": "fallback_002",
            "title": "Full Stack Engineer",
            "company": "StartupXYZ",
            "location": "Remote",
            "work_model": "remote",
            "match_score": 96,
            "salary_range": "₹12L - ₹20L",
            "tags": ["Python", "React", "PostgreSQL"],
            "match_reasons": ["Full stack matches your profile", "Remote work available"],
            "cardBg": "#D8B4FE",
            "matchBg": "#FEF08A",
            "matchColor": "#000000"
        },
        {
            "job_id": "fallback_003",
            "title": "Backend Developer",
            "company": "BigTech Solutions",
            "location": "Hyderabad",
            "work_model": "hybrid",
            "match_score": 97,
            "salary_range": "₹18L - ₹30L",
            "tags": ["Python", "AWS", "Microservices"],
            "match_reasons": ["Backend focus matches your skills", "Great career growth potential"],
            "cardBg": "#FEF08A",
            "matchBg": "#E6F6D4",
            "matchColor": "#000000"
        },
        {
            "job_id": "fallback_004",
            "title": "Frontend Specialist",
            "company": "InnovateLabs",
            "location": "Pune",
            "work_model": "onsite",
            "match_score": 95,
            "salary_range": "₹14L - ₹22L",
            "tags": ["React", "TypeScript", "UI/UX"],
            "match_reasons": ["UI skills in high demand", "Modern tech stack"],
            "cardBg": "#E6F6D4",
            "matchBg": "#D8B4FE",
            "matchColor": "#000000"
        },
        {
            "job_id": "fallback_005",
            "title": "DevOps Engineer",
            "company": "CloudFirst",
            "location": "Chennai",
            "work_model": "hybrid",
            "match_score": 96,
            "salary_range": "₹16L - ₹28L",
            "tags": ["Docker", "Kubernetes", "AWS"],
            "match_reasons": ["DevOps skills highly valued", "Growing market demand"],
            "cardBg": "#D8B4FE",
            "matchBg": "#FEF08A",
            "matchColor": "#000000"
        },
        {
            "job_id": "fallback_006",
            "title": "Product Engineer",
            "company": "Productive.io",
            "location": "Remote",
            "work_model": "remote",
            "match_score": 97,
            "salary_range": "₹20L - ₹35L",
            "tags": ["Product Management", "React", "Node.js"],
            "match_reasons": ["Product mindset matches profile", "Leadership potential"],
            "cardBg": "#FEF08A",
            "matchBg": "#E6F6D4",
            "matchColor": "#000000"
        }
    ]

from app.models.dashboard import UserDashboardData
from app.models.jobs import Job, JobApplication, SavedJob
from app.models.profile import UserSkill, UserExperience
from app.models.user import User
from app.models.ai_pages import SkillGapAnalysis, MarketInsightsCache, MarketData
from app.services.groq_service import call_groq_json

logger = logging.getLogger(__name__)

# Rate limiting: minimum 5 minutes between AI calls per user
MIN_AI_CALL_INTERVAL = timedelta(minutes=5)
PROFILE_COMPLETION_THRESHOLD = 50  # Minimum % to trigger AI


def get_user_skills_list(db: Session, user_id: str) -> List[str]:
    """Get user's skills as formatted strings."""
    skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
    return [f"{s.name} ({s.level})" for s in skills]


def get_user_experience_summary(db: Session, user_id: str) -> str:
    """Get brief experience summary for AI context."""
    exps = db.query(UserExperience).filter(
        UserExperience.user_id == user_id
    ).order_by(UserExperience.start_date.desc()).all()

    if not exps:
        return "No work experience listed"

    lines = []
    for exp in exps[:3]:  # Top 3 experiences
        status = "Current" if exp.current else str(exp.end_date or "")
        lines.append(f"- {exp.title} at {exp.company or 'Unknown'} ({exp.start_date or ''} to {status})")
    return "\n".join(lines)


# AI functions removed - dashboard uses manual data only

async def generate_and_save_ai_top_picks(db: Session, user_id: str) -> dict:
    """Get user's application stats."""
    applied_count = db.query(JobApplication).filter(
        JobApplication.user_id == user_id
    ).count()

    saved_count = db.query(SavedJob).filter(
        SavedJob.user_id == user_id
    ).count()

    # Get user profile completion
    user = db.query(User).filter(User.id == user_id).first()
    profile_completion = 0
    if user:
        # Use getattr() for safe attribute access - won't crash if field is missing
        fields = [
            getattr(user, 'first_name', None),
            getattr(user, 'last_name', None),
            getattr(user, 'email', None),
            getattr(user, 'headline', None),
            getattr(user, 'location', None),
            getattr(user, 'bio', None),
            getattr(user, 'linkedin', None),
            getattr(user, 'github', None),
            getattr(user, 'portfolio', None),
            getattr(user, 'avatar_url', None),
        ]
        filled = sum(1 for f in fields if f)
        profile_completion = int((filled / len(fields)) * 100)

    return {
        "applied_count": applied_count,
        "saved_count": saved_count,
        "interviews_count": 0,  # Will be updated when interview feature added
        "profile_completion": profile_completion,
        "first_name": getattr(user, 'first_name', None) if user else None,
        "full_name": getattr(user, 'full_name', None) if user else None,
    }


def get_market_trends_data(db: Session) -> Dict[str, Any]:
    """Get current market trends for placeholder dashboard."""
    # Get latest market data
    market_entries = db.query(MarketData).order_by(MarketData.created_at.desc()).limit(10).all()
    
    # Extract trending skills from skills_in_demand field
    trending_skills = []
    hot_roles = []
    salary_ranges = []
    
    for entry in market_entries:
        if entry.skills_in_demand:
            # skills_in_demand is list of dicts with skill_name
            if isinstance(entry.skills_in_demand, list):
                for skill in entry.skills_in_demand:
                    if isinstance(skill, dict) and skill.get('skill_name'):
                        trending_skills.append(skill['skill_name'])
                    elif isinstance(skill, str):
                        trending_skills.append(skill)
        if entry.role:
            hot_roles.append(entry.role)
        if entry.salary_min and entry.salary_max:
            salary_ranges.append((entry.salary_min + entry.salary_max) / 2)
    
    # Get unique values
    trending_skills = list(dict.fromkeys(trending_skills))[:8]  # Top 8 unique
    hot_roles = list(dict.fromkeys(hot_roles))[:5]  # Top 5 unique
    
    # Calculate average salary
    avg_salary = sum(salary_ranges) / len(salary_ranges) if salary_ranges else 800000
    
    # Format salary for display
    avg_salary_str = f"₹{avg_salary/100000:.1f}L - ₹{(avg_salary*1.5)/100000:.1f}L"
    
    # Current market skills (2024-2025 trends)
    default_skills = [
        {"skill_name": "React.js", "demand_score": 0.95, "trend_direction": "up", "user_has": False, "salary_premium": "+18%"},
        {"skill_name": "Python", "demand_score": 0.93, "trend_direction": "up", "user_has": False, "salary_premium": "+15%"},
        {"skill_name": "Node.js", "demand_score": 0.88, "trend_direction": "stable", "user_has": False, "salary_premium": "+12%"},
        {"skill_name": "AWS", "demand_score": 0.90, "trend_direction": "up", "user_has": False, "salary_premium": "+20%"},
        {"skill_name": "TypeScript", "demand_score": 0.85, "trend_direction": "up", "user_has": False, "salary_premium": "+10%"},
        {"skill_name": "Docker", "demand_score": 0.82, "trend_direction": "up", "user_has": False, "salary_premium": "+14%"},
        {"skill_name": "Kubernetes", "demand_score": 0.78, "trend_direction": "up", "user_has": False, "salary_premium": "+22%"},
        {"skill_name": "AI/ML", "demand_score": 0.96, "trend_direction": "up", "user_has": False, "salary_premium": "+35%"},
    ]
    
    # Use market data skills if available, otherwise defaults
    skills_in_demand = []
    for i, skill_name in enumerate(trending_skills[:8] if trending_skills else [s["skill_name"] for s in default_skills]):
        base_skill = default_skills[i] if i < len(default_skills) else default_skills[0]
        skills_in_demand.append({
            "skill_name": skill_name,
            "demand_score": base_skill["demand_score"] - (i * 0.02),
            "trend_direction": "up",
            "user_has": False,
            "salary_premium": base_skill["salary_premium"]
        })
    
    # Mock top picks (locked/placeholder jobs)
    top_picks = [
        {
            "job_id": f"placeholder_{i}",
            "title": hot_roles[i] if i < len(hot_roles) else f"Senior {['Developer', 'Engineer', 'Manager'][i%3]}",
            "company": ["TechCorp", "StartupXYZ", "BigTech Inc", "InnovateLabs", "FutureWorks"][i%5],
            "location": ["Bangalore", "Remote", "Hyderabad", "Pune", "Chennai"][i%5],
            "work_model": ["hybrid", "remote", "onsite"][i%3],
            "match_score": 95,
            "salary_range": f"₹{8+i}L - ₹{15+i}L",
            "tags": [trending_skills[i] if i < len(trending_skills) else "In-Demand", "Trending", "Hot"] if trending_skills else ["In-Demand", "Trending", "Hot"],
            "match_reasons": ["Complete your profile to see personalized match reasons", "Add skills that match this role"],
            "is_placeholder": True
        }
        for i in range(6)
    ]
    
    # Mock missing skills (generic)
    missing_skills = [
        {"skill": "Complete profile to see missing skills", "importance": "High", "impact": "Finish your profile to get personalized skill recommendations", "jobs_requiring": 0}
    ]
    
    return {
        "top_picks": top_picks,
        "missing_skills": missing_skills,
        "skills_in_demand": skills_in_demand,
        "market_snapshot": {
            "hot_roles": hot_roles if hot_roles else ["Full Stack Developer", "AI Engineer", "DevOps Engineer"],
            "avg_salary_for_profile": avg_salary_str,
            "market_trend": "Tech hiring is growing 15% YoY. Complete your profile to see personalized insights!",
            "companies_actively_hiring": len(market_entries) * 3 if market_entries else 150,
            "message": "Complete your profile to unlock personalized job matches"
        }
    }


def check_rate_limit(db: Session, user_id: str) -> tuple[bool, Optional[datetime]]:
    """Check if user can make AI call. Returns (allowed, next_available_time)."""
    last_entry = db.query(UserDashboardData).filter(
        UserDashboardData.user_id == user_id
    ).order_by(UserDashboardData.generated_at.desc()).first()
    
    if not last_entry or not last_entry.generated_at:
        return True, None
    
    now = datetime.now(timezone.utc)
    time_since_last = now - last_entry.generated_at
    
    if time_since_last < MIN_AI_CALL_INTERVAL:
        next_available = last_entry.generated_at + MIN_AI_CALL_INTERVAL
        return False, next_available
    
    return True, None


# Daily AI call limit
MAX_AI_CALLS_PER_DAY = 5


def check_daily_ai_limit(db: Session, user_id: str) -> tuple[bool, int, int]:
    """
    Check daily AI generation limit (5 per day per user).
    Returns: (allowed, calls_made_today, calls_remaining)
    """
    from app.models.dashboard import UserAICallTracking
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Get or create today's tracking record
    tracking = db.query(UserAICallTracking).filter(
        UserAICallTracking.user_id == user_id,
        UserAICallTracking.date == today
    ).first()
    
    if not tracking:
        # No calls made today
        return True, 0, MAX_AI_CALLS_PER_DAY
    
    calls_remaining = MAX_AI_CALLS_PER_DAY - tracking.call_count
    allowed = calls_remaining > 0
    
    return allowed, tracking.call_count, max(0, calls_remaining)


def record_ai_call(db: Session, user_id: str):
    """Record an AI generation call for daily tracking."""
    from app.models.dashboard import UserAICallTracking
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    tracking = db.query(UserAICallTracking).filter(
        UserAICallTracking.user_id == user_id,
        UserAICallTracking.date == today
    ).first()
    
    if not tracking:
        # Create new tracking record for today
        tracking = UserAICallTracking(
            user_id=user_id,
            date=today,
            call_count=1,
            last_call_at=datetime.now(timezone.utc)
        )
        db.add(tracking)
    else:
        # Increment existing record
        tracking.call_count += 1
        tracking.last_call_at = datetime.now(timezone.utc)
    
    db.commit()


def generate_dashboard_data(
    db: Session,
    user_id: str,
    force_refresh: bool = False
) -> UserDashboardData:
    """
    Generate personalized dashboard data using Groq AI.
    Returns 6 best jobs with >90% match, missing skills, skills in demand.
    """

    # Check cache (valid for 6 hours)
    if not force_refresh:
        now = datetime.now(timezone.utc)
        # Check if ANY data exists for this user (for debugging)
        any_data = db.query(UserDashboardData).filter(
            UserDashboardData.user_id == user_id
        ).first()
        
        if any_data:
            logger.info(f"DEBUG: Found data for user={user_id}, expires_at={any_data.expires_at}, now={now}, expired={any_data.expires_at < now if any_data.expires_at else 'N/A'}")
        else:
            logger.info(f"DEBUG: No data found for user={user_id}")
        
        cached = db.query(UserDashboardData).filter(
            UserDashboardData.user_id == user_id,
            UserDashboardData.expires_at >= now
        ).first()

        if cached:
            logger.info(f"Dashboard cache HIT: user={user_id} - serving from database (expires: {cached.expires_at})")
            return cached
        else:
            logger.info(f"Dashboard cache MISS: user={user_id} - will call AI")

    # Get user data
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check profile completion
    stats = get_user_stats(db, user_id)
    profile_completion = stats.get("profile_completion", 0)
    
    # If profile incomplete (< 50%), return market trends (no AI call)
    if profile_completion < PROFILE_COMPLETION_THRESHOLD:
        logger.info(f"Profile incomplete ({profile_completion}%), returning market trends for user={user_id}")
        
        now = datetime.now(timezone.utc)
        expires = now + timedelta(hours=1)  # Market data refreshes hourly
        
        market_data = get_market_trends_data(db)
        
        # Create placeholder dashboard entry (not saved to DB to avoid clutter)
        placeholder = UserDashboardData(
            id="placeholder",
            user_id=user_id,
            top_picks=market_data["top_picks"],
            missing_skills=market_data["missing_skills"],
            skills_in_demand=market_data["skills_in_demand"],
            market_snapshot=market_data["market_snapshot"],
            stats_summary=stats,
            generated_at=now,
            expires_at=expires,
            ai_model_used="market_trends_placeholder"
        )
        return placeholder
    
    # Profile complete - proceed with AI
    user_skills = get_user_skills_list(db, user_id)
    user_experience = get_user_experience_summary(db, user_id)
    user_name = user.full_name or user.first_name or "Job Seeker"

    # Get available jobs from database
    available_jobs = db.query(Job).filter(Job.is_active == True).limit(30).all()

    # Handle empty state gracefully
    if not available_jobs or not user_skills:
        stats = get_user_stats(db, user_id)
        now = datetime.now(timezone.utc)
        expires = now + timedelta(hours=6)
        
        # Clean old dashboard data
        db.query(UserDashboardData).filter(
            UserDashboardData.user_id == user_id
        ).delete()
        
        # Create empty dashboard placeholder
        empty_data = UserDashboardData(
            user_id=user_id,
            top_picks=[],
            missing_skills=[],
            skills_in_demand=[],
            market_snapshot={
                "message": "No jobs available yet",
                "hot_roles": [],
                "avg_salary_for_profile": "N/A",
                "market_trend": "Add jobs to see market insights",
                "companies_actively_hiring": 0
            },
            stats_summary=stats,
            generated_at=now,
            expires_at=expires,
            ai_model_used="none"
        )
        
        try:
            db.add(empty_data)
            db.commit()
            db.refresh(empty_data)
            logger.info(f"Empty dashboard created: user={user_id}")
            return empty_data
        except Exception as e:
            db.rollback()
            logger.error(f"Dashboard save error: {e}")
            raise HTTPException(status_code=500, detail="Could not save dashboard data")

    # Format jobs for AI prompt
    jobs_text = "\n".join([
        f"ID:{j.id} | Title: {j.title} | Company: {j.company_name} | Location: {j.location or 'Not specified'} | "
        f"Skills: {', '.join(j.core_skills or [])} | Work Model: {j.work_model or 'Not specified'} | "
        f"Experience: {j.min_experience_years or 0}+ yrs | Salary: {j.salary_min or 0}-{j.salary_max or 0}"
        for j in available_jobs
    ])

    # AI Prompt for comprehensive dashboard generation
    prompt = f"""
Generate a personalized job dashboard for this candidate. Be specific and realistic.

CANDIDATE PROFILE:
Name: {user_name}
Skills: {', '.join(user_skills)}
Experience Summary:
{user_experience}

AVAILABLE JOBS IN DATABASE:
{jobs_text}

Return this exact JSON structure:
{{
    "top_picks": [
        {{
            "job_id": "<exact job ID from list>",
            "title": "<job title>",
            "company": "<company name>",
            "location": "<location>",
            "work_model": "<remote/hybrid/onsite>",
            "match_score": <integer 90-100>,
            "salary_range": "<salary string like ₹8L - ₹12L>",
            "tags": ["<tag1>", "<tag2>", "<tag3>"],
            "match_reasons": [
                "<specific reason based on actual skill overlap>",
                "<specific reason based on experience fit>",
                "<specific reason - be detailed, not generic>"
            ]
        }}
    ],
    "missing_skills": [
        {{
            "skill": "<skill name>",
            "importance": "<High|Medium|Low>",
            "impact": "<one sentence explaining why this skill matters for their profile>",
            "jobs_requiring": <integer count>
        }}
    ],
    "skills_in_demand": [
        {{
            "skill_name": "<skill>",
            "demand_score": <0.0 to 1.0>,
            "trend_direction": "<up|down|stable>",
            "user_has": <true|false>,
            "salary_premium": "<percentage like '+15%' or 'N/A'>"
        }}
    ],
    "market_snapshot": {{
        "hot_roles": ["<role1>", "<role2>", "<role3>"],
        "avg_salary_for_profile": "<salary range>",
        "market_trend": "<one sentence market summary>",
        "companies_actively_hiring": <integer>
    }}
}}

CRITICAL RULES:
1. Return exactly 6 jobs in top_picks, ALL must have match_score >= 90
2. Only use job IDs that exist in the available jobs list
3. match_reasons must be SPECIFIC - mention actual skills from their profile and job requirements
4. missing_skills: List 4-6 skills they DON'T have that are commonly required in available jobs
5. skills_in_demand: List 8 trending skills relevant to their profile
6. Be realistic - don't inflate match scores artificially
7. For match_reasons, explain the ACTUAL connection between their skills and job requirements
8. market_snapshot should be personalized based on their skills and experience level
"""

    result = call_groq_json(
        prompt=prompt,
        system_prompt="You are an expert technical recruiter and career advisor. Provide accurate, personalized job recommendations with honest match scores based on actual skill overlap.",
        model="groq/compound-mini",  # 70K tokens/min, no daily limit
        temperature=0.2,
        max_tokens=4000
    )

    if not result:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Try again shortly."
        )

    # Get user stats
    stats = get_user_stats(db, user_id)

    # Prepare data for storage
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=6)

    # Clean old dashboard data for this user
    db.query(UserDashboardData).filter(
        UserDashboardData.user_id == user_id
    ).delete()

    # Create new dashboard data
    dashboard_data = UserDashboardData(
        user_id=user_id,
        top_picks=result.get("top_picks", []),
        missing_skills=result.get("missing_skills", []),
        skills_in_demand=result.get("skills_in_demand", []),
        market_snapshot=result.get("market_snapshot", {}),
        stats_summary=stats,
        generated_at=now,
        expires_at=expires,
        ai_model_used="groq-llama"
    )

    try:
        db.add(dashboard_data)
        db.commit()
        db.refresh(dashboard_data)
        logger.info(f"Dashboard SAVED: user={user_id} jobs={len(result.get('top_picks', []))} expires={expires}")
        
        # Return dict instead of ORM object for proper serialization
        return {
            "user_id": dashboard_data.user_id,
            "top_picks": dashboard_data.top_picks,
            "missing_skills": dashboard_data.missing_skills,
            "skills_in_demand": dashboard_data.skills_in_demand,
            "market_snapshot": dashboard_data.market_snapshot,
            "stats": dashboard_data.stats_summary,
            "generated_at": dashboard_data.generated_at,
            "expires_at": dashboard_data.expires_at,
            "profile_completion": stats.get("profile_completion", 0)
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Dashboard save ERROR: {e}")
        raise HTTPException(status_code=500, detail="Could not save dashboard data")


def get_dashboard_data(db: Session, user_id: str, force_refresh: bool = False) -> dict:
    """
    Get dashboard data - from cache or generate new.
    Returns formatted response for frontend.
    """
    # Get user stats for profile completion
    stats = get_user_stats(db, user_id)
    profile_completion = stats.get("profile_completion", 0)
    
    # Check if this is a market trends placeholder
    is_placeholder = profile_completion < PROFILE_COMPLETION_THRESHOLD
    
    # Check rate limiting if forcing refresh
    rate_limit_info = {}
    if force_refresh and not is_placeholder:
        allowed, next_available = check_rate_limit(db, user_id)
        if not allowed:
            rate_limit_info = {
                "rate_limited": True,
                "next_update_available": next_available.isoformat() if next_available else None,
                "message": f"Please wait {MIN_AI_CALL_INTERVAL.seconds // 60} minutes between refreshes"
            }
            # Return cached data instead
            force_refresh = False
    
    dashboard = generate_dashboard_data(db, user_id, force_refresh)
    
    # Check if this is an empty/placeholder dashboard
    is_empty = not dashboard.top_picks and dashboard.ai_model_used == "none"
    is_market_trends = dashboard.ai_model_used == "market_trends_placeholder"

    return {
        "user_id": user_id,
        "data_source": "market_trends" if is_market_trends else ("ai_generated" if not is_empty else "empty"),
        "profile_completion": profile_completion,
        "top_picks": dashboard.top_picks or [],
        "missing_skills": dashboard.missing_skills or [],
        "skills_in_demand": dashboard.skills_in_demand or [],
        "market_snapshot": dashboard.market_snapshot or {},
        "stats": dashboard.stats_summary or stats,
        "generated_at": dashboard.generated_at,
        "expires_at": dashboard.expires_at,
        "is_fresh": force_refresh,
        "is_empty": is_empty,
        **rate_limit_info
    }


async def generate_and_save_ai_top_picks(db: Session, user_id: str) -> dict:
    """
    DEPRECATED: AI generation removed.
    Returns fallback picks from database only.
    """
    return {
        "top_picks": get_fallback_top_picks(),
        "message": "AI disabled - using manual data",
        "ai_enabled": False
    }


def get_cached_dashboard_data(db: Session, user_id: str) -> dict:
    """
    Get dashboard data from cache only - FAST, no AI calls.
    Returns cached data or empty state with profile completion info.
    """
    from app.models.dashboard import UserDashboardData
    
    # Get user stats for profile completion
    stats = get_user_stats(db, user_id)
    profile_completion = stats.get("profile_completion", 0)
    
    # Check if profile is incomplete
    if profile_completion < PROFILE_COMPLETION_THRESHOLD:
        # Return incomplete profile data (no AI needed)
        market_data = get_market_trends_data(db)
        return {
            "user_id": user_id,
            "data_source": "incomplete_profile",
            "profile_completion": profile_completion,
            "top_picks": market_data["top_picks"],
            "missing_skills": market_data["missing_skills"],
            "skills_in_demand": market_data["skills_in_demand"],
            "market_snapshot": market_data["market_snapshot"],
            "stats": stats,
            "generated_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "is_fresh": False,
            "is_empty": False,
            "needs_completion": True,
            "message": "Complete your profile to 50% to unlock personalized AI insights"
        }
    
    # Try to get cached data
    now = datetime.now(timezone.utc)
    cached = db.query(UserDashboardData).filter(
        UserDashboardData.user_id == user_id
    ).order_by(UserDashboardData.generated_at.desc()).first()
    
    if cached and cached.top_picks and len(cached.top_picks) > 0:
        # Has cached data
        is_expired = cached.expires_at and cached.expires_at < now
        return {
            "user_id": user_id,
            "data_source": "cached" if not is_expired else "expired",
            "profile_completion": profile_completion,
            "top_picks": cached.top_picks or [],
            "missing_skills": cached.missing_skills or [],
            "skills_in_demand": cached.skills_in_demand or [],
            "market_snapshot": cached.market_snapshot or {},
            "stats": cached.stats_summary or stats,
            "generated_at": cached.generated_at,
            "expires_at": cached.expires_at,
            "is_fresh": False,
            "is_empty": False,
            "needs_ai_refresh": is_expired
        }
    
    # No cached data - return mock/placeholder with generation flag
    market_data = get_market_trends_data(db)
    now = datetime.now(timezone.utc)
    return {
        "user_id": user_id,
        "data_source": "needs_generation",
        "profile_completion": profile_completion,
        "top_picks": market_data["top_picks"],  # Placeholder jobs
        "missing_skills": market_data["missing_skills"],  # Placeholder
        "skills_in_demand": market_data["skills_in_demand"],
        "market_snapshot": market_data["market_snapshot"],
        "stats": stats,
        "generated_at": now,
        "expires_at": now + timedelta(hours=1),
        "is_fresh": False,
        "is_empty": True,
        "needs_generation": True,
        "message": "Generating your personalized dashboard..."
    }
