"""
Profile service - business logic for profile management.
"""

import logging
import time
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.user import User
from app.models.profile import UserSkill, UserExperience, UserEducation
from app.models.preferences import UserPreference
from app.schemas.profile import ProfileUpdate, FullProfileResponse, ProfileResponse
from app.schemas.skills import SkillCreate, SkillUpdate, BulkSkillsUpdate
from app.schemas.experience import ExperienceCreate, ExperienceUpdate, BulkExperienceUpdate
from app.schemas.education import EducationCreate, EducationUpdate, BulkEducationUpdate
from app.schemas.preferences import PreferencesUpdate
from app.utils.profile_completion import calculate_profile_completion

logger = logging.getLogger(__name__)


def get_user_or_404(db: Session, user_id: str) -> User:
    """Get user or raise 404."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def update_profile_completion(db: Session, user: User):
    """Update profile completion score for user."""
    try:
        score = calculate_profile_completion(user)
        user.profile_completion = score
        user.profile_completion_updated_at = datetime.now(timezone.utc)
        db.commit()
    except Exception as e:
        logger.warning(f"Could not update profile completion: {e}")


# ─── Profile ────────────────────────────────────────────────────────────────

def get_full_profile(db: Session, user_id: str) -> dict:
    """Get full profile with all related data."""
    user = db.query(User).options(
        joinedload(User.skills),
        joinedload(User.experience),
        joinedload(User.education),
        joinedload(User.preferences),
        joinedload(User.resumes)
    ).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "profile": user,
        "skills": user.skills or [],
        "experience": user.experience or [],
        "education": user.education or [],
        "preferences": user.preferences,
        "resume_count": len(user.resumes) if user.resumes else 0
    }


def update_profile(db: Session, user_id: str, data: ProfileUpdate) -> User:
    """Update user profile."""
    user = get_user_or_404(db, user_id)

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(user, field, value)

    if 'first_name' in update_data or 'last_name' in update_data:
        user.update_full_name()

    try:
        db.commit()
        db.refresh(user)
        update_profile_completion(db, user)
        logger.info(f"Profile updated for user: {user_id}")
        return user
    except Exception as e:
        db.rollback()
        logger.error(f"Profile update error: {e}")
        raise HTTPException(status_code=500, detail="Profile update failed")


# ─── Skills ─────────────────────────────────────────────────────────────────

def get_skills(db: Session, user_id: str) -> List[UserSkill]:
    """Get all skills for user."""
    return db.query(UserSkill).filter(
        UserSkill.user_id == user_id
    ).order_by(UserSkill.created_at).all()


def add_skill(db: Session, user_id: str, data: SkillCreate) -> UserSkill:
    """Add a new skill."""
    skill_id = data.id or f"skill_{int(time.time() * 1000)}"

    existing = db.query(UserSkill).filter(
        UserSkill.user_id == user_id,
        UserSkill.id == skill_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Skill with this ID already exists")

    duplicate_name = db.query(UserSkill).filter(
        UserSkill.user_id == user_id,
        UserSkill.name == data.name.strip()
    ).first()
    if duplicate_name:
        raise HTTPException(
            status_code=409,
            detail=f"Skill '{data.name}' already exists in your profile"
        )

    skill = UserSkill(
        id=skill_id,
        user_id=user_id,
        name=data.name.strip(),
        level=data.level.value,
        source=data.source
    )

    try:
        db.add(skill)
        db.commit()
        db.refresh(skill)
        user = get_user_or_404(db, user_id)
        db.refresh(user)
        update_profile_completion(db, user)
        return skill
    except Exception as e:
        db.rollback()
        logger.error(f"Add skill error: {e}")
        raise HTTPException(status_code=500, detail="Could not add skill")


def update_skill(
    db: Session, user_id: str, skill_id: str, data: SkillUpdate
) -> UserSkill:
    """Update an existing skill."""
    skill = db.query(UserSkill).filter(
        UserSkill.id == skill_id,
        UserSkill.user_id == user_id
    ).first()

    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    if data.name:
        duplicate = db.query(UserSkill).filter(
            UserSkill.user_id == user_id,
            UserSkill.name == data.name.strip(),
            UserSkill.id != skill_id
        ).first()
        if duplicate:
            raise HTTPException(
                status_code=409,
                detail=f"Skill '{data.name}' already exists"
            )
        skill.name = data.name.strip()

    if data.level:
        skill.level = data.level.value

    try:
        db.commit()
        db.refresh(skill)
        return skill
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not update skill")


def delete_skill(db: Session, user_id: str, skill_id: str):
    """Delete a skill."""
    skill = db.query(UserSkill).filter(
        UserSkill.id == skill_id,
        UserSkill.user_id == user_id
    ).first()

    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    try:
        db.delete(skill)
        db.commit()
        user = get_user_or_404(db, user_id)
        db.refresh(user)
        update_profile_completion(db, user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not delete skill")


def bulk_update_skills(
    db: Session, user_id: str, data: BulkSkillsUpdate
) -> List[UserSkill]:
    """Replace all skills with new list."""
    try:
        db.query(UserSkill).filter(UserSkill.user_id == user_id).delete()

        skills = []
        seen_names = set()
        for i, skill_data in enumerate(data.skills):
            name = skill_data.name.strip().lower()
            if name in seen_names:
                continue
            seen_names.add(name)

            skill_id = skill_data.id or f"skill_{int(time.time() * 1000)}_{i}"
            skill = UserSkill(
                id=skill_id,
                user_id=user_id,
                name=skill_data.name.strip(),
                level=skill_data.level.value,
                source=skill_data.source
            )
            db.add(skill)
            skills.append(skill)

        db.commit()
        user = get_user_or_404(db, user_id)
        db.refresh(user)
        update_profile_completion(db, user)
        return skills
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Bulk skills update error: {e}")
        raise HTTPException(status_code=500, detail="Bulk update failed")


# ─── Experience ──────────────────────────────────────────────────────────────

def get_experience(db: Session, user_id: str) -> List[UserExperience]:
    """Get all experience entries for user."""
    return db.query(UserExperience).filter(
        UserExperience.user_id == user_id
    ).order_by(UserExperience.created_at.desc()).all()


def add_experience(
    db: Session, user_id: str, data: ExperienceCreate
) -> UserExperience:
    """Add a new experience entry."""
    exp_id = data.id or f"exp_{int(time.time() * 1000)}"

    existing = db.query(UserExperience).filter(
        UserExperience.id == exp_id,
        UserExperience.user_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Experience with this ID exists")

    exp = UserExperience(
        id=exp_id,
        user_id=user_id,
        title=data.title.strip(),
        company=data.company,
        location=data.location,
        start_date=data.start_date,
        end_date=data.end_date if not data.current else None,
        current=data.current or False,
        description=data.description,
        source=data.source
    )

    try:
        db.add(exp)
        db.commit()
        db.refresh(exp)
        user = get_user_or_404(db, user_id)
        db.refresh(user)
        update_profile_completion(db, user)
        return exp
    except Exception as e:
        db.rollback()
        logger.error(f"Add experience error: {e}")
        raise HTTPException(status_code=500, detail="Could not add experience")


def update_experience(
    db: Session, user_id: str, exp_id: str, data: ExperienceUpdate
) -> UserExperience:
    """Update an existing experience entry."""
    exp = db.query(UserExperience).filter(
        UserExperience.id == exp_id,
        UserExperience.user_id == user_id
    ).first()

    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exp, field, value)

    if exp.current:
        exp.end_date = None

    try:
        db.commit()
        db.refresh(exp)
        return exp
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not update experience")


def delete_experience(db: Session, user_id: str, exp_id: str):
    """Delete an experience entry."""
    exp = db.query(UserExperience).filter(
        UserExperience.id == exp_id,
        UserExperience.user_id == user_id
    ).first()

    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    try:
        db.delete(exp)
        db.commit()
        user = get_user_or_404(db, user_id)
        db.refresh(user)
        update_profile_completion(db, user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not delete experience")


def bulk_update_experience(
    db: Session, user_id: str, data: BulkExperienceUpdate
) -> List[UserExperience]:
    """Replace all experience entries with new list."""
    try:
        db.query(UserExperience).filter(
            UserExperience.user_id == user_id
        ).delete()

        exps = []
        for i, exp_data in enumerate(data.experience):
            exp_id = exp_data.id or f"exp_{int(time.time() * 1000)}_{i}"
            exp = UserExperience(
                id=exp_id,
                user_id=user_id,
                title=exp_data.title.strip(),
                company=exp_data.company,
                location=exp_data.location,
                start_date=exp_data.start_date,
                end_date=exp_data.end_date if not exp_data.current else None,
                current=exp_data.current or False,
                description=exp_data.description,
                source=exp_data.source
            )
            db.add(exp)
            exps.append(exp)

        db.commit()
        user = get_user_or_404(db, user_id)
        db.refresh(user)
        update_profile_completion(db, user)
        return exps
    except Exception as e:
        db.rollback()
        logger.error(f"Bulk experience update error: {e}")
        raise HTTPException(status_code=500, detail="Bulk update failed")


# ─── Education ───────────────────────────────────────────────────────────────

def get_education(db: Session, user_id: str) -> List[UserEducation]:
    """Get all education entries for user."""
    return db.query(UserEducation).filter(
        UserEducation.user_id == user_id
    ).order_by(UserEducation.created_at.desc()).all()


def add_education(
    db: Session, user_id: str, data: EducationCreate
) -> UserEducation:
    """Add a new education entry."""
    edu_id = data.id or f"edu_{int(time.time() * 1000)}"

    existing = db.query(UserEducation).filter(
        UserEducation.id == edu_id,
        UserEducation.user_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Education with this ID exists")

    edu = UserEducation(
        id=edu_id,
        user_id=user_id,
        degree=data.degree.strip(),
        field=data.field,
        school=data.school,
        info=data.info,
        source=data.source
    )

    try:
        db.add(edu)
        db.commit()
        db.refresh(edu)
        user = get_user_or_404(db, user_id)
        db.refresh(user)
        update_profile_completion(db, user)
        return edu
    except Exception as e:
        db.rollback()
        logger.error(f"Add education error: {e}")
        raise HTTPException(status_code=500, detail="Could not add education")


def update_education(
    db: Session, user_id: str, edu_id: str, data: EducationUpdate
) -> UserEducation:
    """Update an existing education entry."""
    edu = db.query(UserEducation).filter(
        UserEducation.id == edu_id,
        UserEducation.user_id == user_id
    ).first()

    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(edu, field, value)

    try:
        db.commit()
        db.refresh(edu)
        return edu
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not update education")


def delete_education(db: Session, user_id: str, edu_id: str):
    """Delete an education entry."""
    edu = db.query(UserEducation).filter(
        UserEducation.id == edu_id,
        UserEducation.user_id == user_id
    ).first()

    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")

    try:
        db.delete(edu)
        db.commit()
        user = get_user_or_404(db, user_id)
        db.refresh(user)
        update_profile_completion(db, user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not delete education")


def bulk_update_education(
    db: Session, user_id: str, data: BulkEducationUpdate
) -> List[UserEducation]:
    """Replace all education entries with new list."""
    try:
        db.query(UserEducation).filter(
            UserEducation.user_id == user_id
        ).delete()

        edus = []
        for i, edu_data in enumerate(data.education):
            edu_id = edu_data.id or f"edu_{int(time.time() * 1000)}_{i}"
            edu = UserEducation(
                id=edu_id,
                user_id=user_id,
                degree=edu_data.degree.strip(),
                field=edu_data.field,
                school=edu_data.school,
                info=edu_data.info,
                source=edu_data.source
            )
            db.add(edu)
            edus.append(edu)

        db.commit()
        user = get_user_or_404(db, user_id)
        db.refresh(user)
        update_profile_completion(db, user)
        return edus
    except Exception as e:
        db.rollback()
        logger.error(f"Bulk education update error: {e}")
        raise HTTPException(status_code=500, detail="Bulk update failed")


# ─── Preferences ─────────────────────────────────────────────────────────────

def get_preferences(db: Session, user_id: str) -> Optional[UserPreference]:
    """Get user preferences."""
    return db.query(UserPreference).filter(
        UserPreference.user_id == user_id
    ).first()


def upsert_preferences(
    db: Session, user_id: str, data: PreferencesUpdate
) -> UserPreference:
    """Create or update user preferences."""
    pref = db.query(UserPreference).filter(
        UserPreference.user_id == user_id
    ).first()

    if not pref:
        pref = UserPreference(user_id=user_id)
        db.add(pref)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pref, field, value)

    try:
        db.commit()
        db.refresh(pref)
        return pref
    except Exception as e:
        db.rollback()
        logger.error(f"Preferences update error: {e}")
        raise HTTPException(status_code=500, detail="Could not update preferences")
