"""
AI Pages Service - Core AI page generation logic for JobFor.
Handles Job Match, Skill Gap Analysis, Resume Analysis, AI Recommendations, and Market Insights.
"""

import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from app.models.ai_pages import (
    JobMatchHistory, SkillGapAnalysis,
    ResumeAnalysis, AIRecommendation, MarketInsightsCache
)
from app.models.jobs import Job
from app.models.resume import UserResume
from app.models.profile import UserSkill, UserExperience, UserEducation
from app.models.user import User
from app.services.groq_service import call_groq_json
from app.schemas.ai_pages import (
    SkillGapRequest, MarketInsightsRequest
)

logger = logging.getLogger(__name__)

POPULAR_ROLES = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "Machine Learning Engineer", "DevOps Engineer",
    "Cloud Architect", "Product Manager", "Mobile Developer",
    "Security Engineer", "Data Engineer", "Software Architect"
]

# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_user_skills_list(db: Session, user_id: str) -> List[str]:
    skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
    return [f"{s.name} ({s.level})" for s in skills]

def get_user_experience_summary(db: Session, user_id: str) -> str:
    exps = db.query(UserExperience).filter(
        UserExperience.user_id == user_id
    ).order_by(UserExperience.start_date.desc()).all()

    if not exps:
        return "No work experience listed"

    lines = []
    for exp in exps:
        status = "Current" if exp.current else str(exp.end_date or "")
        lines.append(f"- {exp.title} at {exp.company or 'Unknown'} ({exp.start_date or ''} to {status})")
        if exp.description and isinstance(exp.description, list):
            for bullet in exp.description[:3]:
                lines.append(f"  • {bullet}")
    return "\n".join(lines)

def get_user_education_summary(db: Session, user_id: str) -> str:
    edus = db.query(UserEducation).filter(
        UserEducation.user_id == user_id
    ).all()
    if not edus:
        return "No education listed"
    lines = []
    for edu in edus:
        lines.append(f"- {edu.degree} in {edu.field or 'N/A'} from {edu.school or 'N/A'}")
    return "\n".join(lines)

def get_user_profile_summary(db: Session, user_id: str) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}
    return {
        "name": user.full_name or user.first_name,
        "headline": user.headline,
        "location": user.location,
        "skills": get_user_skills_list(db, user_id),
        "experience": get_user_experience_summary(db, user_id),
        "education": get_user_education_summary(db, user_id)
    }

# ─── Job Match ────────────────────────────────────────────────────────────────

def calculate_job_match(
    db: Session,
    user_id: str,
    job_id: str,
    force_recalculate: bool = False
) -> JobMatchHistory:

    # Check cache first (valid for 24 hours)
    if not force_recalculate:
        cached = db.query(JobMatchHistory).filter(
            JobMatchHistory.user_id == user_id,
            JobMatchHistory.job_id == job_id,
            JobMatchHistory.calculated_at >= datetime.now(timezone.utc) - timedelta(hours=24)
        ).order_by(JobMatchHistory.calculated_at.desc()).first()

        if cached:
            logger.info(f"Job match cache hit: user={user_id} job={job_id}")
            return cached

    # Get job details
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get user data
    user_skills = get_user_skills_list(db, user_id)
    user_experience = get_user_experience_summary(db, user_id)

    if not user_skills:
        raise HTTPException(
            status_code=400,
            detail="Add skills to your profile before calculating job match"
        )

    prompt = f"""
Analyze how well this candidate matches the job and return a JSON match report.

JOB DETAILS:
Title: {job.title}
Company: {job.company_name}
Required Skills: {', '.join(job.core_skills or [])}
Experience Required: {job.min_experience_years or 0}+ years
Job Type: {job.job_type}
Work Model: {job.work_model}
Requirements: {', '.join(job.requirements or [])}

CANDIDATE PROFILE:
Skills: {', '.join(user_skills)}
Experience:
{user_experience}

Return this exact JSON:
{{
    "ai_match_score": <integer 0-100>,
    "match_verdict": "<one line verdict like 'Strong Match' or 'Partial Match'>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "gaps": ["<gap 1>", "<gap 2>"],
    "skill_matches": {{
        "matched": ["<skill>", "<skill>"],
        "missing": ["<skill>", "<skill>"],
        "partial": ["<skill>", "<skill>"]
    }},
    "scoring_breakdown": {{
        "skills_score": <0-40>,
        "experience_score": <0-30>,
        "overall_fit_score": <0-30>,
        "total": <0-100>
    }},
    "recommendation": "<2-3 sentence actionable recommendation for the candidate>"
}}

Rules:
- Score honestly. 90+ means near perfect match.
- Strengths should be specific skills or experiences that match well.
- Gaps should be specific missing skills or experience.
- Recommendation should be helpful and specific.
"""

    result = call_groq_json(
        prompt=prompt,
        system_prompt="You are an expert technical recruiter and career coach. Analyze job-candidate fit accurately.",
        model="meta-llama/llama-4-scout-17b-16e-instruct",  # 30K tokens/min, 1K req/day
        temperature=0.1,
        max_tokens=2000
    )

    if not result:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Try again shortly."
        )

    # Save to DB
    match_record = JobMatchHistory(
        user_id=user_id,
        job_id=job_id,
        ai_match_score=result.get("ai_match_score", 0),
        match_verdict=result.get("match_verdict", ""),
        skill_matches=result.get("skill_matches", {}),
        scoring_breakdown=result.get("scoring_breakdown", {}),
        strengths=result.get("strengths", []),
        gaps=result.get("gaps", []),
        recommendation=result.get("recommendation", ""),
        is_quick_match=False
    )

    try:
        db.add(match_record)
        db.commit()
        db.refresh(match_record)
        logger.info(f"Job match calculated: score={match_record.ai_match_score}")
        return match_record
    except Exception as e:
        db.rollback()
        logger.error(f"Job match save error: {e}")
        raise HTTPException(status_code=500, detail="Could not save match result")

# ─── Skill Gap Analysis ───────────────────────────────────────────────────────

def analyze_skill_gap(
    db: Session,
    user_id: str,
    target_role: str,
    force_recalculate: bool = False
) -> SkillGapAnalysis:

    # Check cache (valid for 7 days)
    if not force_recalculate:
        cached = db.query(SkillGapAnalysis).filter(
            SkillGapAnalysis.user_id == user_id,
            SkillGapAnalysis.target_role == target_role,
            SkillGapAnalysis.analyzed_at >= datetime.now(timezone.utc) - timedelta(days=7)
        ).order_by(SkillGapAnalysis.analyzed_at.desc()).first()

        if cached:
            logger.info(f"Skill gap cache hit: user={user_id} role={target_role}")
            return cached

    # Get user skills
    user_skills = get_user_skills_list(db, user_id)
    user_experience = get_user_experience_summary(db, user_id)

    if not user_skills:
        raise HTTPException(
            status_code=400,
            detail="Add skills to your profile before analyzing skill gaps"
        )

    prompt = f"""
Analyze the skill gap between this candidate and the target role.

TARGET ROLE: {target_role}

CANDIDATE SKILLS: {', '.join(user_skills)}

CANDIDATE EXPERIENCE:
{user_experience}

Return this exact JSON:
{{
    "readiness_score": <integer 0-100>,
    "readiness_label": "<Ready to Apply|Almost Ready|Needs Work|Beginner>",
    "matched_skills": ["<skill that matches role requirement>"],
    "missing_skills": ["<important skill candidate does not have>"],
    "skills_to_improve": ["<skill candidate has but needs to level up>"],
    "gap_summary": "<2-3 sentence summary of where candidate stands>",
    "personalized_learning_path": [
        {{
            "step": 1,
            "skill": "<skill name>",
            "action": "<specific action to take>",
            "resources": ["<resource name>"],
            "estimated_weeks": <number>
        }}
    ]
}}

Rules:
- readiness_score 80+ = Ready to Apply
- readiness_score 60-79 = Almost Ready  
- readiness_score 40-59 = Needs Work
- readiness_score below 40 = Beginner
- missing_skills: top 5 most important skills missing for this role
- skills_to_improve: skills candidate has at lower level than needed
- learning_path: max 5 steps, most impactful first
- Be specific and actionable, not generic
"""

    result = call_groq_json(
        prompt=prompt,
        system_prompt="You are an expert technical career advisor. Give accurate, specific skill gap analysis.",
        model="meta-llama/llama-4-scout-17b-16e-instruct",  # 30K tokens/min, 1K req/day
        temperature=0.1,
        max_tokens=2500
    )

    if not result:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Try again shortly."
        )

    # Map score to label
    score = result.get("readiness_score", 0)
    if score >= 80:
        label = "Ready to Apply"
    elif score >= 60:
        label = "Almost Ready"
    elif score >= 40:
        label = "Needs Work"
    else:
        label = "Beginner"

    analysis = SkillGapAnalysis(
        user_id=user_id,
        target_role=target_role,
        readiness_score=score,
        readiness_label=label,
        matched_skills=result.get("matched_skills", []),
        missing_skills=result.get("missing_skills", []),
        skills_to_improve=result.get("skills_to_improve", []),
        personalized_learning_path=result.get("personalized_learning_path", []),
        gap_summary=result.get("gap_summary", "")
    )

    try:
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        logger.info(f"Skill gap analyzed: role={target_role} score={score}")
        return analysis
    except Exception as e:
        db.rollback()
        logger.error(f"Skill gap save error: {e}")
        raise HTTPException(status_code=500, detail="Could not save analysis")

def get_skill_gap_history(db: Session, user_id: str) -> List[SkillGapAnalysis]:
    return db.query(SkillGapAnalysis).filter(
        SkillGapAnalysis.user_id == user_id
    ).order_by(SkillGapAnalysis.analyzed_at.desc()).limit(10).all()

# ─── Resume Analysis ──────────────────────────────────────────────────────────

def analyze_resume(
    db: Session,
    user_id: str,
    resume_id: Optional[str] = None,
    force_recalculate: bool = False
) -> ResumeAnalysis:

    # Get resume
    if resume_id:
        resume = db.query(UserResume).filter(
            UserResume.id == resume_id,
            UserResume.user_id == user_id
        ).first()
    else:
        resume = db.query(UserResume).filter(
            UserResume.user_id == user_id,
            UserResume.is_default == True
        ).first()
        if not resume:
            resume = db.query(UserResume).filter(
                UserResume.user_id == user_id
            ).order_by(UserResume.uploaded_at.desc()).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="No resume found. Please upload a resume first."
        )

    if not resume.raw_text:
        raise HTTPException(
            status_code=400,
            detail="Resume has no extractable text. Please re-upload."
        )

    # Check cache (valid for 24 hours)
    if not force_recalculate:
        cached = db.query(ResumeAnalysis).filter(
            ResumeAnalysis.resume_id == resume.id,
            ResumeAnalysis.user_id == user_id,
            ResumeAnalysis.analyzed_at >= datetime.now(timezone.utc) - timedelta(hours=24)
        ).order_by(ResumeAnalysis.analyzed_at.desc()).first()

        if cached:
            logger.info(f"Resume analysis cache hit: resume={resume.id}")
            return cached

    prompt = f"""
Analyze this resume for ATS (Applicant Tracking System) compatibility and quality.

RESUME TEXT:
{resume.raw_text[:8000]}

Return this exact JSON:
{{
    "ats_fit_score": <integer 0-100>,
    "score_feedback": "<one sentence interpretation of the score>",
    "keywords_found": ["<keyword present in resume>", ...],
    "keywords_missing": ["<important keyword missing>", ...],
    "pro_tip": "<single most impactful improvement tip>",
    "enhancements": [
        {{
            "id": 1,
            "title": "<enhancement title>",
            "subtitle": "<section or category>",
            "priority": "<High|Medium|Low>",
            "description": "<specific actionable suggestion>"
        }}
    ]
}}

ATS Scoring Criteria:
- Contact information present: +10
- Professional summary/objective: +10
- Quantified achievements (numbers, percentages): +15
- Relevant keywords and skills: +20
- Clean formatting (no tables, graphics): +10
- Action verbs used: +10
- Education section: +10
- Work experience with descriptions: +15

Rules:
- keywords_found: list actual keywords found (max 15)
- keywords_missing: top 8 keywords that should be added
- enhancements: 4-6 specific improvements, highest priority first
- Be specific, not generic. Reference actual content from the resume.
"""

    result = call_groq_json(
        prompt=prompt,
        system_prompt="You are an expert ATS and resume optimization specialist. Give precise, actionable feedback.",
        model="meta-llama/llama-4-scout-17b-16e-instruct",  # 30K tokens/min, 1K req/day
        temperature=0.1,
        max_tokens=2500
    )

    if not result:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Try again shortly."
        )

    analysis = ResumeAnalysis(
        resume_id=str(resume.id),
        user_id=user_id,
        ats_fit_score=result.get("ats_fit_score", 0),
        score_feedback=result.get("score_feedback", ""),
        keywords_found=result.get("keywords_found", []),
        keywords_missing=result.get("keywords_missing", []),
        pro_tip=result.get("pro_tip", ""),
        enhancements=result.get("enhancements", []),
        has_analysis=True
    )

    try:
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        logger.info(f"Resume analyzed: score={analysis.ats_fit_score}")
        return analysis
    except Exception as e:
        db.rollback()
        logger.error(f"Resume analysis save error: {e}")
        raise HTTPException(status_code=500, detail="Could not save analysis")

# ─── AI Recommendations ───────────────────────────────────────────────────────

def get_ai_recommendations(
    db: Session,
    user_id: str,
    force_recalculate: bool = False
) -> dict:

    # Check cache (valid for 6 hours)
    if not force_recalculate:
        cached = db.query(AIRecommendation).filter(
            AIRecommendation.user_id == user_id,
            AIRecommendation.created_at >= datetime.now(timezone.utc) - timedelta(hours=6)
        ).first()

        if cached:
            recs = db.query(AIRecommendation).filter(
                AIRecommendation.user_id == user_id,
                AIRecommendation.created_at >= datetime.now(timezone.utc) - timedelta(hours=6)
            ).all()
            logger.info(f"Recommendations cache hit: user={user_id}")
            return _format_recommendations_response(recs, user_id, cached.created_at)

    # Get user data
    profile = get_user_profile_summary(db, user_id)

    if not profile.get("skills"):
        raise HTTPException(
            status_code=400,
            detail="Complete your profile with skills before getting recommendations"
        )

    # Get available jobs
    jobs = db.query(Job).filter(Job.is_active == True).limit(15).all()

    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs available")

    jobs_text = "\n".join([
        f"- ID:{j.id} | {j.title} at {j.company_name} | Skills: {', '.join(j.core_skills or [])} | {j.work_model} | {j.min_experience_years or 0}+ yrs"
        for j in jobs
    ])

    prompt = f"""
Recommend the best matching jobs for this candidate from the available jobs list.

CANDIDATE:
Name: {profile.get('name')}
Skills: {', '.join(profile.get('skills', []))}
Experience: {profile.get('experience')}
Location preference: {profile.get('location')}

AVAILABLE JOBS:
{jobs_text}

Return this exact JSON:
{{
    "top_picks": [
        {{
            "job_id": "<exact job ID from the list>",
            "match_percentage": <integer 0-100>,
            "recommendation_type": "top_picks",
            "reasons": [
                "<specific reason 1 this job fits the candidate>",
                "<specific reason 2>"
            ]
        }}
    ],
    "match_summary": {{
        "overall_market_fit": <0-100>,
        "strongest_skills": ["<skill>", "<skill>"],
        "recommended_focus": "<one sentence on what to focus on>"
    }}
}}

Rules:
- Return top 5 best matching jobs only
- Use exact job IDs from the list
- match_percentage must be based on actual skill overlap
- reasons must be specific, not generic
- Order by match_percentage descending
"""

    result = call_groq_json(
        prompt=prompt,
        system_prompt="You are an expert job recommendation engine. Match candidates to jobs accurately.",
        model="meta-llama/llama-4-scout-17b-16e-instruct",  # 30K tokens/min, 1K req/day
        temperature=0.2,
        max_tokens=2000
    )

    if not result:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Try again shortly."
        )

    # Clear old recommendations
    db.query(AIRecommendation).filter(
        AIRecommendation.user_id == user_id
    ).delete()

    # Save new recommendations
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=6)
    saved_recs = []

    for rec in result.get("top_picks", []):
        job_id = rec.get("job_id")
        if not job_id:
            continue

        # Verify job exists
        job_exists = db.query(Job).filter(Job.id == job_id).first()
        if not job_exists:
            continue

        recommendation = AIRecommendation(
            user_id=user_id,
            job_id=job_id,
            recommendation_type=rec.get("recommendation_type", "top_picks"),
            match_percentage=rec.get("match_percentage", 0),
            reasons=rec.get("reasons", []),
            created_at=now,
            expires_at=expires
        )
        db.add(recommendation)
        saved_recs.append(recommendation)

    try:
        db.commit()
        for rec in saved_recs:
            db.refresh(rec)
        logger.info(f"Recommendations generated: {len(saved_recs)} for user={user_id}")
        return _format_recommendations_response(saved_recs, user_id, now, result.get("match_summary"))
    except Exception as e:
        db.rollback()
        logger.error(f"Recommendations save error: {e}")
        raise HTTPException(status_code=500, detail="Could not save recommendations")

def _format_recommendations_response(
    recs: list,
    user_id: str,
    generated_at: datetime,
    match_summary: Optional[dict] = None
) -> dict:
    return {
        "user_id": user_id,
        "top_picks": [
            {
                "job_id": str(r.job_id),
                "match_percentage": r.match_percentage,
                "recommendation_type": r.recommendation_type,
                "reasons": r.reasons or []
            }
            for r in recs
        ],
        "match_summary": match_summary,
        "generated_at": generated_at
    }

# ─── Market Insights ─────────────────────────────────────────────────────────

def get_market_insights(
    db: Session,
    user_id: str,
    role: Optional[str] = None,
    location: Optional[str] = None,
    force_recalculate: bool = False
) -> MarketInsightsCache:

    # Check cache (valid for 24 hours)
    if not force_recalculate:
        query = db.query(MarketInsightsCache).filter(
            MarketInsightsCache.user_id == user_id,
            MarketInsightsCache.generated_at >= datetime.now(timezone.utc) - timedelta(hours=24)
        )
        if role:
            query = query.filter(MarketInsightsCache.role == role)
        if location:
            query = query.filter(MarketInsightsCache.location == location)

        cached = query.order_by(MarketInsightsCache.generated_at.desc()).first()
        if cached:
            logger.info(f"Market insights cache hit: user={user_id}")
            return cached

    # Get user skills for personalization
    user_skills = get_user_skills_list(db, user_id)
    user_skill_names = [s.split(" (")[0] for s in user_skills]

    target_role = role or "Software Engineer"
    target_location = location or "India"

    prompt = f"""
Generate realistic Indian IT job market insights for a software professional.

TARGET ROLE: {target_role}
TARGET LOCATION: {target_location}
CANDIDATE SKILLS: {', '.join(user_skill_names[:10])}

Return this exact JSON:
{{
    "salary_data": {{
        "role": "{target_role}",
        "location": "{target_location}",
        "min_salary": <integer in INR annual>,
        "median_salary": <integer in INR annual>,
        "max_salary": <integer in INR annual>,
        "growth_percentage": <decimal like 8.5>,
        "active_listings": <integer>,
        "avg_time_to_hire": <integer days>
    }},
    "top_skills_demand": [
        {{
            "skill_name": "<skill>",
            "demand_score": <0.0 to 1.0>,
            "user_has_skill": <true if in candidate skills else false>,
            "trend_direction": "<up|down|stable>"
        }}
    ],
    "companies_hiring": [
        {{
            "name": "<company name>",
            "roles_count": <integer>,
            "company_type": "<Tech|Startup|Enterprise|MNC>",
            "hiring_velocity": "<fast|moderate|slow>"
        }}
    ],
    "experience_distribution": [
        {{"level": "Entry (0-2 yrs)", "percentage": <integer>}},
        {{"level": "Mid (2-5 yrs)", "percentage": <integer>}},
        {{"level": "Senior (5-8 yrs)", "percentage": <integer>}},
        {{"level": "Lead (8+ yrs)", "percentage": <integer>}}
    ],
    "market_summary": "<2-3 sentence summary of the current market>"
}}

Rules:
- Salary data must be realistic for Indian IT market in 2024-2025
- top_skills_demand: list 8 most in-demand skills for this role
- companies_hiring: list 6 real companies hiring for this role in India
- experience_distribution percentages must add up to 100
- user_has_skill: check against candidate skills list provided
"""

    result = call_groq_json(
        prompt=prompt,
        system_prompt="You are an expert Indian IT job market analyst. Provide accurate, current market data.",
        model="meta-llama/llama-4-scout-17b-16e-instruct",  # 30K tokens/min, 1K req/day
        temperature=0.2,
        max_tokens=2500
    )

    if not result:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Try again shortly."
        )

    now = datetime.now(timezone.utc)
    cache = MarketInsightsCache(
        user_id=user_id,
        role=target_role,
        location=target_location,
        data_json=result,
        generated_at=now,
        expires_at=now + timedelta(hours=24)
    )

    try:
        db.add(cache)
        db.commit()
        db.refresh(cache)
        logger.info(f"Market insights generated: role={target_role} location={target_location}")
        return cache
    except Exception as e:
        db.rollback()
        logger.error(f"Market insights save error: {e}")
        raise HTTPException(status_code=500, detail="Could not save market insights")
