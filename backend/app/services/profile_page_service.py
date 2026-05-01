"""
ProfilePageService - Dedicated AI service for Profile Page only.

This service handles AI-powered profile generation and updates from resume text.
It is self-contained and must NOT be used by other pages (Dashboard, Jobs, etc.).
"""

import logging
import re
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from app.services.groq_service import call_groq_json
from app.models.user import User
from app.models.profile import UserSkill, UserExperience, UserEducation
from app.models.resume import UserResume

logger = logging.getLogger(__name__)

# Constants
MAX_RESUME_CHARS = 15000  # Safe limit for Groq context window
MAX_RETRIES = 1


def parse_resume_to_json(resume_text: str) -> Dict[str, Any]:
    """
    Step 1: Convert raw resume text into structured JSON using AI.
    
    Args:
        resume_text: Raw text extracted from uploaded PDF resume
        
    Returns:
        Structured JSON with parsed resume data
        
    Edge Cases Handled:
    - Empty resume text returns empty structure
    - Very large text is truncated with warning
    - Non-English resumes are parsed as-is
    """
    # Edge Case 1: Empty resume text
    if not resume_text or not resume_text.strip():
        logger.info("Empty resume text provided, returning empty structure")
        return _get_empty_parsed_resume()
    
    # Edge Case 12: Very large resume text - truncate safely
    original_length = len(resume_text)
    if original_length > MAX_RESUME_CHARS:
        logger.warning(f"Resume text too long ({original_length} chars), truncating to {MAX_RESUME_CHARS}")
        resume_text = resume_text[:MAX_RESUME_CHARS]
    
    # Clean the text
    resume_text = resume_text.strip()
    
    system_prompt = """You are a strict JSON resume parser.
Your job is to extract structured data from resume text.

RULES:
- Output ONLY valid JSON. No explanations. No markdown. No comments.
- Extract all relevant information you can find.
- Normalize dates to YYYY-MM format where possible.
- If a field is missing, use empty string "" or empty array [].
- Never invent fake data.
- Never include fields not defined in the schema.
"""

    prompt = f"""Parse the following resume text into structured JSON.

RESUME TEXT:
{resume_text}

Return this exact JSON structure:
{{
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "summary": "string",
    "skills": ["string"],
    "experience": [
        {{
            "company": "string",
            "role": "string",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM | Present",
            "description": "string"
        }}
    ],
    "education": [
        {{
            "institution": "string",
            "degree": "string",
            "field": "string",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM"
        }}
    ],
    "projects": [
        {{
            "name": "string",
            "description": "string",
            "techStack": ["string"],
            "link": "string"
        }}
    ],
    "certifications": [
        {{
            "name": "string",
            "issuer": "string",
            "date": "YYYY-MM"
        }}
    ],
    "links": {{
        "linkedin": "string",
        "github": "string",
        "portfolio": "string"
    }}
}}

Important:
- Use empty strings "" for missing text fields
- Use empty arrays [] for missing list fields
- Never return null or undefined
- Normalize all dates to YYYY-MM format
"""

    try:
        result = call_groq_json(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.1,
            max_tokens=4000
        )
        
        if not result:
            logger.error("Groq returned no result for resume parsing")
            return _get_empty_parsed_resume()
        
        # Ensure all required keys exist
        return _ensure_complete_structure(result)
        
    except Exception as e:
        logger.error(f"Resume parsing failed: {e}")
        return _get_empty_parsed_resume()


def generate_updated_profile(
    existing_profile: Dict[str, Any],
    parsed_resume: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Step 2: Send both existing profile and parsed resume to Groq AI.
    AI returns a COMPLETE NEW PROFILE JSON (not partial, not patches).
    
    Args:
        existing_profile: Current full user profile from DB
        parsed_resume: Structured JSON from parse_resume_to_json()
        
    Returns:
        Complete updated profile JSON matching the strict schema
        
    Edge Cases Handled:
    - Empty existing profile builds entirely from resume
    - Empty resume returns existing profile unchanged
    - AI invalid JSON triggers retry once
    - AI commentary/markdown is stripped
    - Missing fields filled with defaults
    - Duplicate skills/experiences are deduped
    - Conflicting data prefers most recent/complete info
    - Date format normalization
    - Extra AI hallucinated fields are stripped
    """
    # Edge Case 1 & 2: Handle empty inputs
    has_existing = existing_profile and any(v for v in existing_profile.values() if v not in (None, [], "", {}))
    has_resume = parsed_resume and any(v for v in parsed_resume.values() if v not in (None, [], "", {}))
    
    if not has_resume:
        logger.info("No resume data provided, returning existing profile unchanged")
        return _normalize_profile(existing_profile) if has_existing else _get_empty_profile()
    
    system_prompt = """You are a strict JSON profile generator for a Profile Page only.
You will receive:
- existingProfile (JSON)
- parsedResume (JSON)

Your job:
- Merge them intelligently
- Remove duplicates
- Prefer most recent and complete information
- Return ONE complete updated profile JSON

RULES:
- Output ONLY valid JSON. No explanations. No markdown. No comments.
- Follow the provided schema EXACTLY.
- Never invent fake data.
- Never leave keys missing.
- Use "" for missing strings and [] for missing arrays.
- Normalize dates to YYYY-MM.
- Do not include any field not defined in the schema.
"""

    prompt = f"""Merge the existing profile with the parsed resume data.
Return a complete, updated profile JSON.

EXISTING PROFILE:
{json.dumps(existing_profile, indent=2, default=str)}

PARSED RESUME:
{json.dumps(parsed_resume, indent=2, default=str)}

MERGE RULES:
1. Prefer resume data for experience, education, projects, certifications (more recent)
2. Keep existing profile data for personal info if resume doesn't have it
3. Combine and deduplicate skills (case-insensitive)
4. If both have the same field, prefer the one with MORE complete information
5. Normalize all dates to YYYY-MM format
6. If endDate is missing or "Present", use "Present"

Return this exact JSON structure:
{{
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "summary": "string",
    "skills": ["string"],
    "experience": [
        {{
            "company": "string",
            "role": "string",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM | Present",
            "description": "string"
        }}
    ],
    "education": [
        {{
            "institution": "string",
            "degree": "string",
            "field": "string",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM"
        }}
    ],
    "projects": [
        {{
            "name": "string",
            "description": "string",
            "techStack": ["string"],
            "link": "string"
        }}
    ],
    "certifications": [
        {{
            "name": "string",
            "issuer": "string",
            "date": "YYYY-MM"
        }}
    ],
    "links": {{
        "linkedin": "string",
        "github": "string",
        "portfolio": "string"
    }}
}}

CRITICAL:
- Return ONLY the JSON object
- No markdown code blocks
- No explanations before or after
- All keys must be present even if empty
"""

    # Edge Case 3: Retry once on failure
    for attempt in range(MAX_RETRIES + 1):
        try:
            result = call_groq_json(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.1,
                max_tokens=4000
            )
            
            if result:
                # Edge Case 5, 8, 9: Validate, normalize, and strip extra fields
                validated = validate_profile_schema(result)
                if validated:
                    logger.info(f"Profile generated successfully (attempt {attempt + 1})")
                    return validated
            
            if attempt < MAX_RETRIES:
                logger.warning(f"AI returned invalid result, retrying (attempt {attempt + 1})")
                continue
            else:
                logger.error("AI failed to return valid JSON after retries")
                raise HTTPException(
                    status_code=422,
                    detail="AI could not generate valid profile. Please try again."
                )
                
        except Exception as e:
            if attempt < MAX_RETRIES:
                logger.warning(f"Error calling AI, retrying: {e}")
                continue
            else:
                logger.error(f"Failed to generate profile after retries: {e}")
                raise HTTPException(
                    status_code=503,
                    detail="AI service unavailable. Please try again shortly."
                )
    
    # Should never reach here
    raise HTTPException(status_code=500, detail="Unexpected error in profile generation")


def validate_profile_schema(profile_json: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Step 3: Validate AI output against strict schema.
    
    Args:
        profile_json: JSON object from AI
        
    Returns:
        Validated and normalized profile JSON, or None if invalid
        
    Edge Cases Handled:
    - Missing required fields filled with defaults
    - Extra AI hallucinated fields stripped
    - Date format normalization
    - Duplicate skills/experiences deduped
    - Partial AI output rejected
    """
    if not profile_json or not isinstance(profile_json, dict):
        logger.error("Profile JSON is not a valid object")
        return None
    
    # Edge Case 9: Strip extra fields not in schema
    allowed_fields = {
        "name", "email", "phone", "location", "summary",
        "skills", "experience", "education", "projects",
        "certifications", "links"
    }
    
    cleaned = {k: v for k, v in profile_json.items() if k in allowed_fields}
    
    # Edge Case 5: Fill missing fields with defaults
    result = {
        "name": _ensure_string(cleaned.get("name")),
        "email": _ensure_string(cleaned.get("email")),
        "phone": _ensure_string(cleaned.get("phone")),
        "location": _ensure_string(cleaned.get("location")),
        "summary": _ensure_string(cleaned.get("summary")),
        "skills": _ensure_string_list(cleaned.get("skills")),
        "experience": _validate_experience(cleaned.get("experience")),
        "education": _validate_education(cleaned.get("education")),
        "projects": _validate_projects(cleaned.get("projects")),
        "certifications": _validate_certifications(cleaned.get("certifications")),
        "links": _validate_links(cleaned.get("links"))
    }
    
    # Edge Case 6: Deduplicate skills (case-insensitive, keep original case of first occurrence)
    seen_skills = set()
    unique_skills = []
    for skill in result["skills"]:
        skill_lower = skill.lower()
        if skill_lower not in seen_skills:
            seen_skills.add(skill_lower)
            unique_skills.append(skill)
    result["skills"] = unique_skills
    
    # Edge Case 11: Check for partial output (must have at least name or email or experience)
    has_minimal_data = (
        result["name"] or 
        result["email"] or 
        result["experience"] or 
        result["education"] or
        result["skills"]
    )
    
    if not has_minimal_data:
        logger.error("AI output is too incomplete - no meaningful data found")
        return None
    
    return result


def replace_user_profile(
    db: Session,
    user_id: str,
    new_profile_json: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Step 4: Replace the old profile in DB entirely with the new JSON.
    
    This is an ATOMIC operation - if any part fails, everything is rolled back.
    
    Args:
        db: Database session
        user_id: User ID to update
        new_profile_json: Complete validated profile JSON
        
    Returns:
        The new profile data
        
    Edge Cases Handled:
    - Atomic replace operation (rollback on failure)
    - Network/DB failures return error without overwriting
    - Duplicate checking for skills/experience/education
    """
    # Fetch user with all relationships
    user = db.query(User).options(
        joinedload(User.skills),
        joinedload(User.experience),
        joinedload(User.education)
    ).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Update basic profile info
        if new_profile_json.get("name"):
            name_parts = new_profile_json["name"].split(maxsplit=1)
            user.first_name = name_parts[0]
            user.last_name = name_parts[1] if len(name_parts) > 1 else None
            user.update_full_name()
        
        user.headline = new_profile_json.get("summary", user.headline)
        user.location = new_profile_json.get("location", user.location)
        
        # Update links
        links = new_profile_json.get("links", {})
        if links.get("linkedin"):
            user.linkedin = links["linkedin"]
        if links.get("github"):
            user.github = links["github"]
        if links.get("portfolio"):
            user.portfolio = links["portfolio"]
        
        # Replace skills (delete existing, add new)
        db.query(UserSkill).filter(UserSkill.user_id == user_id).delete()
        
        skills = new_profile_json.get("skills", [])
        seen_skills = set()
        for i, skill_name in enumerate(skills):
            if not skill_name or skill_name.lower() in seen_skills:
                continue
            seen_skills.add(skill_name.lower())
            
            skill = UserSkill(
                id=f"skill_profile_{int(datetime.now().timestamp() * 1000)}_{i}",
                user_id=user_id,
                name=skill_name,
                level="Intermediate",  # Default level from AI
                source="resume"
            )
            db.add(skill)
        
        # Replace experience
        db.query(UserExperience).filter(UserExperience.user_id == user_id).delete()
        
        experience = new_profile_json.get("experience", [])
        for i, exp in enumerate(experience):
            if not exp.get("role"):
                continue
                
            start_date = _parse_date(exp.get("startDate"))
            end_date = None
            current = False
            
            if exp.get("endDate") and exp["endDate"].lower() == "present":
                current = True
            else:
                end_date = _parse_date(exp.get("endDate"))
            
            # Convert description to list if it's a string
            description = exp.get("description", "")
            if isinstance(description, str):
                description = [description] if description.strip() else []
            elif not isinstance(description, list):
                description = []
            
            exp_record = UserExperience(
                id=f"exp_profile_{int(datetime.now().timestamp() * 1000)}_{i}",
                user_id=user_id,
                title=exp["role"],
                company=exp.get("company"),
                location=None,  # Not in our schema currently
                start_date=start_date,
                end_date=end_date,
                current=current,
                description=description,
                source="resume"
            )
            db.add(exp_record)
        
        # Replace education
        db.query(UserEducation).filter(UserEducation.user_id == user_id).delete()
        
        education = new_profile_json.get("education", [])
        for i, edu in enumerate(education):
            if not edu.get("degree"):
                continue
            
            edu_record = UserEducation(
                id=f"edu_profile_{int(datetime.now().timestamp() * 1000)}_{i}",
                user_id=user_id,
                degree=edu["degree"],
                field=edu.get("field"),
                school=edu.get("institution"),
                info=None,  # Not in AI schema
                source="resume"
            )
            db.add(edu_record)
        
        # Edge Case 14: Atomic commit
        db.commit()
        
        # Refresh to get updated data
        db.refresh(user)
        
        # Update profile completion score
        from app.utils.profile_completion import calculate_profile_completion
        user.profile_completion = calculate_profile_completion(user)
        user.profile_completion_updated_at = datetime.now()
        db.commit()
        
        logger.info(f"Profile replaced successfully for user: {user_id}")
        
        return {
            "profile": user,
            "skills": db.query(UserSkill).filter(UserSkill.user_id == user_id).all(),
            "experience": db.query(UserExperience).filter(UserExperience.user_id == user_id).all(),
            "education": db.query(UserEducation).filter(UserEducation.user_id == user_id).all()
        }
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Profile replace failed: {e}")
        # Edge Case 10: Network/DB failures - do not overwrite
        raise HTTPException(
            status_code=500,
            detail="Failed to save profile. No changes were made."
        )


def process_resume_and_update_profile(
    db: Session,
    user_id: str,
    resume_text: str,
    existing_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Complete workflow: Parse resume and update profile in one operation.
    
    This is the main entry point for the Profile Page.
    
    Args:
        db: Database session
        user_id: User ID to update
        resume_text: Raw text from uploaded resume
        existing_profile: Current profile data from DB
        
    Returns:
        Updated profile data
    """
    # Step 1: Parse resume to JSON
    parsed_resume = parse_resume_to_json(resume_text)
    
    # Step 2: Generate updated profile
    new_profile = generate_updated_profile(existing_profile, parsed_resume)
    
    # Step 3: Validate is already done in generate_updated_profile
    
    # Step 4: Replace profile in DB
    return replace_user_profile(db, user_id, new_profile)


# ─── Helper Functions ─────────────────────────────────────────────────────────


def _get_empty_parsed_resume() -> Dict[str, Any]:
    """Return empty parsed resume structure."""
    return {
        "name": "",
        "email": "",
        "phone": "",
        "location": "",
        "summary": "",
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": [],
        "links": {
            "linkedin": "",
            "github": "",
            "portfolio": ""
        }
    }


def _get_empty_profile() -> Dict[str, Any]:
    """Return empty profile structure matching schema."""
    return _get_empty_parsed_resume()


def _ensure_complete_structure(data: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure all required keys exist in parsed resume."""
    empty = _get_empty_parsed_resume()
    result = {}
    
    for key in empty:
        if key == "links":
            links_data = data.get(key, {}) if isinstance(data.get(key), dict) else {}
            result[key] = {
                "linkedin": _ensure_string(links_data.get("linkedin")),
                "github": _ensure_string(links_data.get("github")),
                "portfolio": _ensure_string(links_data.get("portfolio"))
            }
        else:
            result[key] = data.get(key, empty[key])
    
    return result


def _normalize_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize existing profile to match AI output schema."""
    if not profile:
        return _get_empty_profile()
    
    # Convert from DB format to AI schema format
    result = {
        "name": profile.get("full_name", profile.get("name", "")),
        "email": profile.get("email", ""),
        "phone": profile.get("phone", ""),
        "location": profile.get("location", ""),
        "summary": profile.get("headline", profile.get("summary", "")),
        "skills": [],
        "experience": [],
        "education": [],
        "projects": profile.get("projects", []),
        "certifications": profile.get("certifications", []),
        "links": {
            "linkedin": profile.get("linkedin", ""),
            "github": profile.get("github", ""),
            "portfolio": profile.get("portfolio", "")
        }
    }
    
    # Convert skills
    skills = profile.get("skills", [])
    if isinstance(skills, list):
        for skill in skills:
            if isinstance(skill, dict):
                result["skills"].append(skill.get("name", ""))
            elif isinstance(skill, str):
                result["skills"].append(skill)
    
    # Convert experience
    experience = profile.get("experience", [])
    if isinstance(experience, list):
        for exp in experience:
            if isinstance(exp, dict):
                result["experience"].append({
                    "company": exp.get("company", ""),
                    "role": exp.get("title", ""),
                    "startDate": _format_date(exp.get("start_date")),
                    "endDate": "Present" if exp.get("current") else _format_date(exp.get("end_date")),
                    "description": " ".join(exp.get("description", [])) if isinstance(exp.get("description"), list) else str(exp.get("description", ""))
                })
    
    # Convert education
    education = profile.get("education", [])
    if isinstance(education, list):
        for edu in education:
            if isinstance(edu, dict):
                result["education"].append({
                    "institution": edu.get("school", ""),
                    "degree": edu.get("degree", ""),
                    "field": edu.get("field", ""),
                    "startDate": "",
                    "endDate": ""
                })
    
    return result


def _ensure_string(value: Any) -> str:
    """Ensure value is a string, never null."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    return str(value)


def _ensure_string_list(value: Any) -> List[str]:
    """Ensure value is a list of strings."""
    if not value:
        return []
    if isinstance(value, list):
        return [_ensure_string(item) for item in value if item]
    if isinstance(value, str):
        return [value] if value.strip() else []
    return []


def _validate_experience(value: Any) -> List[Dict[str, Any]]:
    """Validate and normalize experience array."""
    if not value or not isinstance(value, list):
        return []
    
    result = []
    seen = set()
    
    for exp in value:
        if not isinstance(exp, dict):
            continue
        
        role = _ensure_string(exp.get("role"))
        company = _ensure_string(exp.get("company"))
        
        # Edge Case 6: Skip duplicates
        key = f"{role.lower()}|{company.lower()}"
        if key in seen or not role:
            continue
        seen.add(key)
        
        # Edge Case 8: Normalize dates
        start_date = _normalize_date(_ensure_string(exp.get("startDate")))
        end_date_raw = _ensure_string(exp.get("endDate"))
        end_date = "Present" if end_date_raw.lower() == "present" else _normalize_date(end_date_raw)
        
        result.append({
            "company": company,
            "role": role,
            "startDate": start_date,
            "endDate": end_date,
            "description": _ensure_string(exp.get("description"))
        })
    
    return result


def _validate_education(value: Any) -> List[Dict[str, Any]]:
    """Validate and normalize education array."""
    if not value or not isinstance(value, list):
        return []
    
    result = []
    seen = set()
    
    for edu in value:
        if not isinstance(edu, dict):
            continue
        
        degree = _ensure_string(edu.get("degree"))
        institution = _ensure_string(edu.get("institution"))
        
        # Skip duplicates
        key = f"{degree.lower()}|{institution.lower()}"
        if key in seen or not degree:
            continue
        seen.add(key)
        
        result.append({
            "institution": institution,
            "degree": degree,
            "field": _ensure_string(edu.get("field")),
            "startDate": _normalize_date(_ensure_string(edu.get("startDate"))),
            "endDate": _normalize_date(_ensure_string(edu.get("endDate")))
        })
    
    return result


def _validate_projects(value: Any) -> List[Dict[str, Any]]:
    """Validate and normalize projects array."""
    if not value or not isinstance(value, list):
        return []
    
    result = []
    seen = set()
    
    for proj in value:
        if not isinstance(proj, dict):
            continue
        
        name = _ensure_string(proj.get("name"))
        if not name or name.lower() in seen:
            continue
        seen.add(name.lower())
        
        tech_stack = proj.get("techStack", [])
        if isinstance(tech_stack, str):
            tech_stack = [tech_stack] if tech_stack.strip() else []
        
        result.append({
            "name": name,
            "description": _ensure_string(proj.get("description")),
            "techStack": _ensure_string_list(tech_stack),
            "link": _ensure_string(proj.get("link"))
        })
    
    return result


def _validate_certifications(value: Any) -> List[Dict[str, Any]]:
    """Validate and normalize certifications array."""
    if not value or not isinstance(value, list):
        return []
    
    result = []
    seen = set()
    
    for cert in value:
        if not isinstance(cert, dict):
            continue
        
        name = _ensure_string(cert.get("name"))
        if not name or name.lower() in seen:
            continue
        seen.add(name.lower())
        
        result.append({
            "name": name,
            "issuer": _ensure_string(cert.get("issuer")),
            "date": _normalize_date(_ensure_string(cert.get("date")))
        })
    
    return result


def _validate_links(value: Any) -> Dict[str, str]:
    """Validate and normalize links object."""
    if not value or not isinstance(value, dict):
        return {"linkedin": "", "github": "", "portfolio": ""}
    
    return {
        "linkedin": _ensure_string(value.get("linkedin")),
        "github": _ensure_string(value.get("github")),
        "portfolio": _ensure_string(value.get("portfolio"))
    }


def _normalize_date(date_str: str) -> str:
    """Normalize date string to YYYY-MM format."""
    if not date_str or date_str.lower() == "present":
        return ""
    
    # Edge Case 8: Try various formats
    patterns = [
        r"(\d{4})-(\d{2})",  # YYYY-MM
        r"(\d{4})/(\d{2})",  # YYYY/MM
        r"(\d{2})-(\d{4})",  # MM-YYYY
        r"(\d{2})/(\d{4})",  # MM/YYYY
        r"(\d{4})",          # YYYY only
    ]
    
    for pattern in patterns:
        match = re.search(pattern, date_str)
        if match:
            groups = match.groups()
            if len(groups) == 2:
                # Check which is year (4 digits)
                if len(groups[0]) == 4:
                    return f"{groups[0]}-{groups[1]}"
                else:
                    return f"{groups[1]}-{groups[0]}"
            elif len(groups) == 1 and len(groups[0]) == 4:
                return f"{groups[0]}-01"  # Default to January if only year
    
    return ""


def _parse_date(date_str: Optional[str]) -> Optional[datetime.date]:
    """Parse date string to date object."""
    if not date_str:
        return None
    
    try:
        # Try YYYY-MM
        if re.match(r"^\d{4}-\d{2}$", date_str):
            return datetime.strptime(date_str, "%Y-%m").date()
        # Try YYYY-MM-DD
        if re.match(r"^\d{4}-\d{2}-\d{2}$", date_str):
            return datetime.strptime(date_str, "%Y-%m-%d").date()
    except Exception:
        pass
    
    return None


def _format_date(date_val: Any) -> str:
    """Format date value to string."""
    if not date_val:
        return ""
    if isinstance(date_val, str):
        return date_val
    if hasattr(date_val, "isoformat"):
        return date_val.isoformat()[:7]  # YYYY-MM
    return str(date_val)
