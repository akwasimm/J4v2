"""
Profile router.
"""

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.profile import ProfileUpdate, ProfileResponse, FullProfileResponse
from app.schemas.preferences import PreferencesUpdate, PreferencesResponse
from app.schemas.common import SuccessResponse

router = APIRouter()


@router.get("/me", response_model=FullProfileResponse)
def get_profile(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import get_full_profile
    return get_full_profile(db, user_id)


@router.put("/me", response_model=ProfileResponse)
def update_profile(
    data: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import update_profile
    return update_profile(db, user_id, data)


@router.put("/complete", response_model=ProfileResponse)
def update_profile_complete(
    data: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # Same as PUT /me, just an alias for frontend compatibility
    from app.services.profile_service import update_profile
    return update_profile(db, user_id, data)


@router.get("/preferences", response_model=PreferencesResponse)
def get_preferences(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import get_preferences
    result = get_preferences(db, user_id)
    if not result:
        # Return empty defaults, never 404
        return PreferencesResponse(
            user_id=user_id,
            employment_types=[],
            remote_preference=None,
            target_salary_min=None,
            target_salary_max=None,
            target_salary_currency="INR",
            preferred_locations=[],
            open_to_relocation=False,
            notice_period=None,
            industry_preference=[],
            job_level_preference=None,
            created_at=None,
            updated_at=None
        )
    return result


@router.put("/preferences", response_model=PreferencesResponse)
def update_preferences(
    data: PreferencesUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import upsert_preferences
    return upsert_preferences(db, user_id, data)


# ─── Profile Page AI Endpoints ───────────────────────────────────────────────

@router.post("/parse-resume", response_model=dict)
def parse_resume_endpoint(
    data: dict,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Parse resume text into structured JSON using AI.
    Profile Page only - not for other pages.
    """
    from app.services.profile_page_service import parse_resume_to_json
    from app.schemas.profile_page import AIProfileSchema
    
    resume_text = data.get("resume_text", "")
    
    if not resume_text or not resume_text.strip():
        return {
            "success": False,
            "error": "Resume text is required",
            "parsed_data": None
        }
    
    try:
        parsed = parse_resume_to_json(resume_text)
        
        # Validate against schema
        validated = AIProfileSchema(**parsed)
        
        return {
            "success": True,
            "parsed_data": validated.dict(),
            "raw_text_length": len(resume_text),
            "parsed_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "parsed_data": None
        }


@router.post("/update-from-resume", response_model=dict)
def update_profile_from_resume_endpoint(
    data: dict,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Complete workflow: Parse resume and update profile via AI.
    Profile Page only - not for other pages.
    
    Workflow:
    1. Parse resume text to structured JSON
    2. Get existing profile
    3. AI merges them intelligently
    4. Replace profile in DB atomically
    """
    from app.services.profile_page_service import (
        parse_resume_to_json,
        generate_updated_profile,
        validate_profile_schema,
        replace_user_profile
    )
    from app.services.profile_service import get_full_profile
    
    resume_text = data.get("resume_text", "")
    
    if not resume_text or not resume_text.strip():
        return {
            "success": False,
            "error": "Resume text is required",
            "code": "EMPTY_RESUME"
        }
    
    try:
        # Step 1: Parse resume
        parsed_resume = parse_resume_to_json(resume_text)
        
        # Step 2: Get existing profile
        existing = get_full_profile(db, user_id)
        
        # Normalize to AI schema format
        existing_normalized = {
            "name": existing.get("profile", {}).get("full_name", ""),
            "email": existing.get("profile", {}).get("email", ""),
            "phone": existing.get("profile", {}).get("phone", ""),
            "location": existing.get("profile", {}).get("location", ""),
            "summary": existing.get("profile", {}).get("headline", ""),
            "skills": [s.name for s in existing.get("skills", [])],
            "experience": [
                {
                    "company": e.company or "",
                    "role": e.title or "",
                    "startDate": e.start_date.isoformat()[:7] if e.start_date else "",
                    "endDate": "Present" if e.current else (e.end_date.isoformat()[:7] if e.end_date else ""),
                    "description": " ".join(e.description) if isinstance(e.description, list) else str(e.description or "")
                }
                for e in existing.get("experience", [])
            ],
            "education": [
                {
                    "institution": e.school or "",
                    "degree": e.degree or "",
                    "field": e.field or "",
                    "startDate": "",
                    "endDate": ""
                }
                for e in existing.get("education", [])
            ],
            "projects": [],
            "certifications": [],
            "links": {
                "linkedin": existing.get("profile", {}).get("linkedin", ""),
                "github": existing.get("profile", {}).get("github", ""),
                "portfolio": existing.get("profile", {}).get("portfolio", "")
            }
        }
        
        # Step 3: Generate updated profile via AI
        new_profile = generate_updated_profile(existing_normalized, parsed_resume)
        
        # Step 4: Validate
        validated = validate_profile_schema(new_profile)
        if not validated:
            return {
                "success": False,
                "error": "AI generated invalid profile structure",
                "code": "VALIDATION_FAILED"
            }
        
        # Step 5: Replace in DB atomically
        result = replace_user_profile(db, user_id, validated)
        
        return {
            "success": True,
            "message": "Profile updated successfully from resume",
            "skills_added": len(result["skills"]),
            "experience_added": len(result["experience"]),
            "education_added": len(result["education"]),
            "updated_at": datetime.utcnow().isoformat(),
            "profile": {
                "profile": result["profile"],
                "skills": result["skills"],
                "experience": result["experience"],
                "education": result["education"],
                "preferences": existing.get("preferences"),
                "resume_count": existing.get("resume_count", 0)
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "code": "UPDATE_FAILED"
        }


@router.post("/ai-preview", response_model=dict)
def preview_profile_update(
    data: dict,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Preview what the profile would look like after AI update.
    Does NOT save to DB - returns preview only.
    Profile Page only.
    """
    from app.services.profile_page_service import (
        parse_resume_to_json,
        generate_updated_profile,
        validate_profile_schema
    )
    from app.services.profile_service import get_full_profile
    
    resume_text = data.get("resume_text", "")
    
    if not resume_text or not resume_text.strip():
        return {
            "success": False,
            "error": "Resume text is required"
        }
    
    try:
        # Parse resume
        parsed_resume = parse_resume_to_json(resume_text)
        
        # Get existing profile
        existing = get_full_profile(db, user_id)
        
        # Normalize existing profile
        existing_normalized = {
            "name": existing.get("profile", {}).get("full_name", ""),
            "email": existing.get("profile", {}).get("email", ""),
            "phone": existing.get("profile", {}).get("phone", ""),
            "location": existing.get("profile", {}).get("location", ""),
            "summary": existing.get("profile", {}).get("headline", ""),
            "skills": [s.name for s in existing.get("skills", [])],
            "experience": [
                {
                    "company": e.company or "",
                    "role": e.title or "",
                    "startDate": e.start_date.isoformat()[:7] if e.start_date else "",
                    "endDate": "Present" if e.current else (e.end_date.isoformat()[:7] if e.end_date else ""),
                    "description": " ".join(e.description) if isinstance(e.description, list) else str(e.description or "")
                }
                for e in existing.get("experience", [])
            ],
            "education": [
                {
                    "institution": e.school or "",
                    "degree": e.degree or "",
                    "field": e.field or "",
                    "startDate": "",
                    "endDate": ""
                }
                for e in existing.get("education", [])
            ],
            "projects": [],
            "certifications": [],
            "links": {
                "linkedin": existing.get("profile", {}).get("linkedin", ""),
                "github": existing.get("profile", {}).get("github", ""),
                "portfolio": existing.get("profile", {}).get("portfolio", "")
            }
        }
        
        # Generate preview (no DB save)
        new_profile = generate_updated_profile(existing_normalized, parsed_resume)
        validated = validate_profile_schema(new_profile)
        
        if not validated:
            return {
                "success": False,
                "error": "AI generated invalid profile structure"
            }
        
        return {
            "success": True,
            "preview": validated,
            "changes": {
                "skills_count": len(validated.get("skills", [])),
                "experience_count": len(validated.get("experience", [])),
                "education_count": len(validated.get("education", []))
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
