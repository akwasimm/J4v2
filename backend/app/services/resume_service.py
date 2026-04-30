"""
Resume service - handles upload, storage, parsing, and profile population.
"""

import os
import time
import logging
from datetime import datetime, timezone, date
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile

from app.models.resume import UserResume
from app.models.profile import UserSkill, UserExperience, UserEducation
from app.models.user import User
from app.core.config import settings
from app.utils.file_handler import (
    read_and_validate_resume,
    read_and_validate_image,
    save_file,
    delete_file,
    generate_stored_filename,
    get_file_url
)
from app.utils.text_extractor import extract_text, clean_extracted_text
from app.services.parser_service import (
    parse_resume_text,
    extract_skills_from_parsed,
    extract_experience_from_parsed,
    extract_education_from_parsed
)
from app.utils.profile_completion import calculate_profile_completion

logger = logging.getLogger(__name__)

MAX_RESUMES_PER_USER = 3


def get_user_resumes(db: Session, user_id: str) -> List[UserResume]:
    """Get all resumes for a user."""
    return db.query(UserResume).filter(
        UserResume.user_id == user_id
    ).order_by(UserResume.uploaded_at.desc()).all()


def get_resume_by_id(db: Session, resume_id: str, user_id: str) -> UserResume:
    """Get a specific resume by ID, verifying ownership."""
    resume = db.query(UserResume).filter(
        UserResume.id == resume_id,
        UserResume.user_id == user_id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


async def upload_resume(
    db: Session,
    user_id: str,
    file: UploadFile,
    auto_parse: bool = True
) -> UserResume:
    """
    Upload resume file, extract text, optionally parse with AI.
    Auto-deletes oldest resume if user has 3 already.
    """
    # Read and validate file
    file_bytes, file_type, original_filename = await read_and_validate_resume(file)
    
    # Check resume count and delete oldest if needed
    existing_resumes = get_user_resumes(db, user_id)
    if len(existing_resumes) >= MAX_RESUMES_PER_USER:
        oldest = existing_resumes[-1]
        logger.info(f"Max resumes reached. Deleting oldest: {oldest.filename}")
        await delete_resume(db, user_id, str(oldest.id))
        existing_resumes = get_user_resumes(db, user_id)
    
    # Generate stored filename
    stored_filename = generate_stored_filename(original_filename, prefix="resume")
    resume_dir = os.path.join(settings.UPLOAD_DIR, "resumes")
    
    # Save file to disk
    file_path = save_file(file_bytes, resume_dir, stored_filename)
    
    # Extract raw text
    raw_text = ""
    try:
        raw_text = extract_text(file_bytes, file_type)
        raw_text = clean_extracted_text(raw_text)
        logger.info(f"Text extracted: {len(raw_text)} characters")
    except Exception as e:
        logger.warning(f"Text extraction failed: {e}")
    
    # If no default resume exists, make this one default
    has_default = any(r.is_default for r in existing_resumes)
    
    # Create resume record
    resume = UserResume(
        user_id=user_id,
        filename=original_filename,
        stored_filename=stored_filename,
        file_path=file_path,
        file_size=len(file_bytes),
        file_type=file_type,
        url=get_file_url(stored_filename, "resumes"),
        is_default=not has_default,
        is_parsed=False,
        raw_text=raw_text
    )
    
    try:
        db.add(resume)
        db.commit()
        db.refresh(resume)
        logger.info(f"Resume record created: {resume.id}")
    except Exception as e:
        db.rollback()
        delete_file(file_path)
        logger.error(f"Resume DB save failed: {e}")
        raise HTTPException(status_code=500, detail="Could not save resume")
    
    # Parse resume with AI if text was extracted and auto_parse is True
    if auto_parse and raw_text:
        try:
            resume = await parse_and_populate(db, resume, user_id)
        except Exception as e:
            logger.warning(f"Auto-parse failed (non-critical): {e}")
    
    return resume


async def parse_and_populate(
    db: Session,
    resume: UserResume,
    user_id: str
) -> UserResume:
    """
    Parse resume text with AI and populate user profile data.
    Updates skills, experience, education from resume.
    """
    if not resume.raw_text:
        logger.warning("No raw text to parse")
        return resume
    
    logger.info(f"Starting AI parsing for resume: {resume.id}")
    
    # Call AI parser
    parsed_data = parse_resume_text(resume.raw_text)
    
    if not parsed_data:
        logger.warning("AI parsing returned no data")
        return resume
    
    # Save parsed data to resume record
    resume.parsed_data = parsed_data
    resume.is_parsed = True
    resume.parsed_at = datetime.now(timezone.utc)
    
    try:
        db.commit()
        db.refresh(resume)
    except Exception as e:
        db.rollback()
        logger.error(f"Could not save parsed data: {e}")
        return resume
    
    # Populate user profile from parsed data
    await populate_profile_from_resume(db, user_id, parsed_data)
    
    logger.info(f"Resume parsed and profile populated for user: {user_id}")
    return resume


async def populate_profile_from_resume(
    db: Session,
    user_id: str,
    parsed_data: dict
):
    """
    Take parsed resume data and populate user's profile.
    Only adds data that doesn't already exist (source=resume records replaced,
    manual records kept).
    """
    try:
        # Update personal info if fields are empty
        personal = parsed_data.get("personal_info", {}) or {}
        user = db.query(User).filter(User.id == user_id).first()
        
        if user:
            if personal.get("headline") and not user.headline:
                user.headline = personal["headline"]
            if personal.get("location") and not user.location:
                user.location = personal["location"]
            if personal.get("linkedin") and not user.linkedin:
                user.linkedin = personal["linkedin"]
            if personal.get("github") and not user.github:
                user.github = personal["github"]
            if personal.get("portfolio") and not user.portfolio:
                user.portfolio = personal["portfolio"]
        
        # Replace all resume-sourced skills
        db.query(UserSkill).filter(
            UserSkill.user_id == user_id,
            UserSkill.source == "resume"
        ).delete()
        
        skills_data = extract_skills_from_parsed(parsed_data)
        seen_skill_names = set()
        
        # Get existing manual skills to avoid duplicates
        existing_manual_skills = db.query(UserSkill).filter(
            UserSkill.user_id == user_id,
            UserSkill.source == "manual"
        ).all()
        for s in existing_manual_skills:
            seen_skill_names.add(s.name.lower())
        
        for i, skill_data in enumerate(skills_data):
            if skill_data["name"].lower() in seen_skill_names:
                continue
            seen_skill_names.add(skill_data["name"].lower())
            
            skill = UserSkill(
                id=f"skill_resume_{int(time.time() * 1000)}_{i}",
                user_id=user_id,
                name=skill_data["name"],
                level=skill_data["level"],
                source="resume"
            )
            db.add(skill)
        
        # Replace all resume-sourced experience
        db.query(UserExperience).filter(
            UserExperience.user_id == user_id,
            UserExperience.source == "resume"
        ).delete()
        
        experience_data = extract_experience_from_parsed(parsed_data)
        for i, exp_data in enumerate(experience_data):
            start_date = None
            if exp_data.get("start_date"):
                try:
                    start_date = date.fromisoformat(exp_data["start_date"])
                except:
                    pass
            
            end_date = None
            if exp_data.get("end_date") and not exp_data.get("current"):
                try:
                    end_date = date.fromisoformat(exp_data["end_date"])
                except:
                    pass
            
            exp = UserExperience(
                id=f"exp_resume_{int(time.time() * 1000)}_{i}",
                user_id=user_id,
                title=exp_data["title"],
                company=exp_data.get("company"),
                location=exp_data.get("location"),
                start_date=start_date,
                end_date=end_date,
                current=exp_data.get("current", False),
                description=exp_data.get("description", []),
                source="resume"
            )
            db.add(exp)
        
        # Replace all resume-sourced education
        db.query(UserEducation).filter(
            UserEducation.user_id == user_id,
            UserEducation.source == "resume"
        ).delete()
        
        education_data = extract_education_from_parsed(parsed_data)
        for i, edu_data in enumerate(education_data):
            edu = UserEducation(
                id=f"edu_resume_{int(time.time() * 1000)}_{i}",
                user_id=user_id,
                degree=edu_data["degree"],
                field=edu_data.get("field"),
                school=edu_data.get("school"),
                info=edu_data.get("info"),
                source="resume"
            )
            db.add(edu)
        
        db.commit()
        
        # Update profile completion
        db.refresh(user)
        score = calculate_profile_completion(user)
        user.profile_completion = score
        user.profile_completion_updated_at = datetime.now(timezone.utc)
        db.commit()
        
        logger.info(f"Profile populated from resume for user: {user_id}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Profile population failed: {e}")
        raise


async def delete_resume(db: Session, user_id: str, resume_id: str):
    """Delete resume file and record."""
    resume = get_resume_by_id(db, resume_id, user_id)
    
    # Delete file from disk
    delete_file(resume.file_path)
    
    was_default = resume.is_default
    
    try:
        db.delete(resume)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not delete resume")
    
    # If deleted resume was default, set next one as default
    if was_default:
        remaining = get_user_resumes(db, user_id)
        if remaining:
            remaining[0].is_default = True
            try:
                db.commit()
            except:
                db.rollback()
    
    logger.info(f"Resume deleted: {resume_id}")


async def set_default_resume(
    db: Session, user_id: str, resume_id: str
) -> UserResume:
    """Set a resume as the default."""
    # Unset all defaults
    db.query(UserResume).filter(
        UserResume.user_id == user_id
    ).update({"is_default": False})
    
    # Set new default
    resume = get_resume_by_id(db, resume_id, user_id)
    resume.is_default = True
    
    try:
        db.commit()
        db.refresh(resume)
        return resume
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not update default resume")


async def upload_avatar(
    db: Session,
    user_id: str,
    file: UploadFile
) -> User:
    """Upload and save user avatar image."""
    file_bytes, file_type, original_filename = await read_and_validate_image(file)
    
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete old avatar if exists
    if user.avatar_url:
        old_path = user.avatar_url.lstrip("/")
        delete_file(old_path)
    
    # Save new avatar
    stored_filename = generate_stored_filename(original_filename, prefix=f"avatar_{user_id[:8]}")
    avatar_dir = os.path.join(settings.UPLOAD_DIR, "avatars")
    file_path = save_file(file_bytes, avatar_dir, stored_filename)
    
    user.avatar_url = get_file_url(stored_filename, "avatars")
    user.avatar_uploaded_at = datetime.now(timezone.utc)
    
    try:
        db.commit()
        db.refresh(user)
        
        score = calculate_profile_completion(user)
        user.profile_completion = score
        db.commit()
        db.refresh(user)
        
        return user
    except Exception as e:
        db.rollback()
        delete_file(file_path)
        raise HTTPException(status_code=500, detail="Could not save avatar")
