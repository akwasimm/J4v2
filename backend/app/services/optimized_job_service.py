"""
Optimized job service with database-level pagination and caching.
This replaces the slow in-memory pagination with efficient database queries.
"""

import logging
from datetime import datetime, timezone, date
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func, desc, asc
from fastapi import HTTPException, status

from app.models.jobs import Job, JobApplication, SavedJob, SavedJobCollection
from app.models.user import User
from app.models.profile import UserSkill, UserExperience
from app.schemas.jobs import JobSearchParams
from app.core.cache import cache_job_search, get_cached_job_search, cached

logger = logging.getLogger(__name__)

# ─── Match Score Calculation ─────────────────────────────────────────────────

def calculate_match_score(job: Job, user_skills: List[str], user_exp_years: int = 0) -> int:
    """
    Calculate personalized match score (0-100) based on:
    - Skill overlap (70%)
    - Experience match (20%)
    - Job freshness (10%)
    """
    if not user_skills:
        base = 65
        freshness_boost = 10 if job.posted_at and (datetime.now(timezone.utc) - job.posted_at).days < 7 else 0
        return min(100, base + freshness_boost)
    
    user_skills_lower = [s.lower().strip() for s in user_skills]
    job_skills = job.core_skills or []
    job_skills_lower = [s.lower().strip() for s in job_skills]
    
    if not job_skills:
        return 70
    
    matches = 0
    for job_skill in job_skills_lower:
        if any(job_skill in user_skill or user_skill in job_skill for user_skill in user_skills_lower):
            matches += 1
    
    skill_score = (matches / len(job_skills)) * 70
    
    exp_score = 0
    if job.min_experience_years:
        if user_exp_years >= job.min_experience_years:
            exp_score = 20
        elif user_exp_years >= job.min_experience_years * 0.7:
            exp_score = 10
        else:
            exp_score = 5
    else:
        exp_score = 15
    
    freshness_score = 0
    if job.posted_at:
        days_old = (datetime.now(timezone.utc) - job.posted_at).days
        if days_old < 3:
            freshness_score = 10
        elif days_old < 7:
            freshness_score = 7
        elif days_old < 14:
            freshness_score = 5
        else:
            freshness_score = 2
    
    total_score = int(skill_score + exp_score + freshness_score)
    return min(100, max(60, total_score))


# ─── User Data Helpers ───────────────────────────────────────────────────────

def get_user_skills_and_exp(db: Session, user_id: str) -> Tuple[List[str], float]:
    """Fetch user skills and experience years in a single optimized query."""
    # Get skills
    skills = db.query(UserSkill.name).filter(UserSkill.user_id == user_id).all()
    user_skills = [s[0] for s in skills]
    
    # Calculate experience years
    experiences = db.query(UserExperience.start_date, UserExperience.end_date, UserExperience.current).filter(
        UserExperience.user_id == user_id
    ).all()
    
    user_exp_years = 0.0
    for start_date, end_date, current in experiences:
        if start_date:
            end = date.today() if current else (end_date or date.today())
            years = (end - start_date).days / 365.25
            user_exp_years += years
    
    return user_skills, user_exp_years


# ─── Optimized Job Search ───────────────────────────────────────────────────

def search_jobs_optimized(
    db: Session,
    params: JobSearchParams,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Optimized job search with database-level pagination.
    Returns paginated results without loading all jobs into memory.
    """
    # Check cache first
    cache_params = params.model_dump()
    cached_result = get_cached_job_search(user_id, cache_params)
    if cached_result:
        logger.info(f"Job search cache hit for user={user_id}")
        return cached_result
    
    effective_user_id = params.user_id or user_id
    user_skills = []
    user_exp_years = 0.0
    
    # Fetch user data once if needed
    if effective_user_id:
        user_skills, user_exp_years = get_user_skills_and_exp(db, effective_user_id)
    
    # Build base query
    query = db.query(Job).filter(Job.is_active == True)
    
    # Apply filters (all at database level)
    if params.q:
        search_term = f"%{params.q.lower()}%"
        query = query.filter(
            or_(
                func.lower(Job.title).like(search_term),
                func.lower(Job.company_name).like(search_term),
                func.lower(Job.description).like(search_term)
            )
        )
    
    if params.location:
        query = query.filter(
            func.lower(Job.location).like(f"%{params.location.lower()}%")
        )
    
    if params.work_model:
        query = query.filter(
            func.lower(Job.work_model) == params.work_model.lower()
        )
    
    if params.job_type:
        query = query.filter(
            func.lower(Job.job_type).like(f"%{params.job_type.lower()}%")
        )
    
    if params.min_exp is not None:
        query = query.filter(
            or_(
                Job.min_experience_years == None,
                Job.min_experience_years <= params.min_exp
            )
        )
    
    if params.max_exp is not None:
        query = query.filter(
            or_(
                Job.min_experience_years == None,
                Job.min_experience_years <= params.max_exp
            )
        )
    
    if params.salary_min:
        query = query.filter(
            or_(
                Job.salary_max == None,
                Job.salary_max >= params.salary_min
            )
        )
    
    if params.salary_max:
        query = query.filter(
            or_(
                Job.salary_min == None,
                Job.salary_min <= params.salary_max
            )
        )
    
    # Get total count efficiently (uses index-only scans when possible)
    total = query.count()
    
    # Determine sorting strategy
    if params.sort_by == "match_score" and effective_user_id:
        # For match score sorting, we need to fetch and score more records
        # to ensure quality results after pagination
        # Fetch 3x page_size to have enough scored jobs
        fetch_limit = min(params.page_size * 3, 100)
        
        # Get recent jobs first as candidates
        candidates = query.order_by(desc(Job.posted_at)).limit(fetch_limit * params.page).all()
        
        # Calculate match scores
        jobs_with_scores = []
        for job in candidates:
            match_score = calculate_match_score(job, user_skills, user_exp_years)
            job.match_score = match_score
            jobs_with_scores.append(job)
        
        # Sort by match score, then by posted date
        jobs_with_scores.sort(key=lambda j: (-j.match_score, j.posted_at or datetime.min.replace(tzinfo=timezone.utc)))
        
        # Apply pagination after sorting
        offset = (params.page - 1) * params.page_size
        paginated_jobs = jobs_with_scores[offset:offset + params.page_size]
        
    elif params.sort_by == "relevance" and params.q:
        # For relevance sorting, prioritize title matches
        query_lower = params.q.lower()
        
        # Get more records for relevance scoring
        fetch_limit = min(params.page_size * 3, 100)
        candidates = query.order_by(desc(Job.posted_at)).limit(fetch_limit * params.page).all()
        
        # Score for relevance and match
        jobs_with_scores = []
        for job in candidates:
            match_score = calculate_match_score(job, user_skills, user_exp_years)
            job.match_score = match_score
            
            # Relevance boost for title match
            title_bonus = 0 if query_lower in job.title.lower() else 1000
            job._relevance_score = (title_bonus, -match_score, job.posted_at or datetime.min.replace(tzinfo=timezone.utc))
            jobs_with_scores.append(job)
        
        # Sort by relevance score
        jobs_with_scores.sort(key=lambda j: j._relevance_score, reverse=False)
        
        # Apply pagination
        offset = (params.page - 1) * params.page_size
        paginated_jobs = jobs_with_scores[offset:offset + params.page_size]
        
    else:
        # Default: database-level sorting by posted date with pagination
        # This is the most efficient - only fetches needed records
        offset = (params.page - 1) * params.page_size
        
        paginated_jobs = query.order_by(desc(Job.posted_at)).offset(offset).limit(params.page_size).all()
        
        # Calculate match scores for display (not for sorting)
        for job in paginated_jobs:
            job.match_score = calculate_match_score(job, user_skills, user_exp_years)
    
    total_pages = (total + params.page_size - 1) // params.page_size
    
    result = {
        "items": paginated_jobs,
        "total": total,
        "page": params.page,
        "page_size": params.page_size,
        "total_pages": total_pages,
        "has_next": params.page < total_pages,
        "has_prev": params.page > 1
    }
    
    # Cache for 60 seconds (short TTL since job data changes)
    cache_job_search(user_id, cache_params, result, ttl=60)
    
    return result


# ─── Fast Job Fetch (no scoring) ──────────────────────────────────────────────

def get_jobs_fast(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    location: Optional[str] = None,
    work_model: Optional[str] = None
) -> Dict[str, Any]:
    """
    Fast job fetch for initial page load with optional filters.
    Returns cached results if available.
    """
    cache_key = f"jobs_fast:{page}:{page_size}:{location}:{work_model}"
    
    @cached(prefix="jobs_fast", ttl_seconds=120)
    def _fetch():
        query = db.query(Job).filter(Job.is_active == True)
        
        if location:
            query = query.filter(func.lower(Job.location).like(f"%{location.lower()}%"))
        
        if work_model:
            query = query.filter(func.lower(Job.work_model) == work_model.lower())
        
        total = query.count()
        offset = (page - 1) * page_size
        
        jobs = query.order_by(desc(Job.posted_at)).offset(offset).limit(page_size).all()
        
        # Assign default match scores
        for job in jobs:
            job.match_score = 75  # Default score for non-personalized results
        
        total_pages = (total + page_size - 1) // page_size
        
        return {
            "items": jobs,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    
    return _fetch()


# ─── Background Cache Warming ────────────────────────────────────────────────

def warm_job_search_cache(db: Session, user_id: str, common_params_list: List[Dict]):
    """
    Pre-warm cache for common search patterns.
    Call this in background task after user login or periodically.
    """
    from app.schemas.jobs import JobSearchParams
    
    for params_dict in common_params_list:
        try:
            params = JobSearchParams(**params_dict)
            search_jobs_optimized(db, params, user_id)
            logger.info(f"Warmed cache for user={user_id} params={params_dict}")
        except Exception as e:
            logger.warning(f"Failed to warm cache: {e}")


def get_common_search_patterns() -> List[Dict]:
    """Return common search parameter combinations to pre-cache."""
    return [
        {"page": 1, "page_size": 10, "sort_by": "posted_at"},
        {"page": 1, "page_size": 20, "sort_by": "match_score"},
        {"page": 1, "page_size": 10, "work_model": "remote", "sort_by": "posted_at"},
        {"page": 1, "page_size": 10, "work_model": "hybrid", "sort_by": "posted_at"},
        {"page": 1, "page_size": 10, "location": "bangalore", "sort_by": "posted_at"},
        {"page": 1, "page_size": 10, "location": "hyderabad", "sort_by": "posted_at"},
        {"page": 1, "page_size": 10, "location": "pune", "sort_by": "posted_at"},
        {"page": 2, "page_size": 10, "sort_by": "posted_at"},
    ]
