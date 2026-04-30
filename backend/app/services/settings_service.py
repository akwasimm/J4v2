"""
Settings Service - Handles user settings, password changes, connected accounts, and data export.
"""

import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.settings import UserSettings, ConnectedAccount
from app.models.user import User
from app.core.security import verify_password, hash_password
from app.schemas.settings import SettingsUpdate, ChangePasswordRequest

logger = logging.getLogger(__name__)

def get_or_create_settings(db: Session, user_id: str) -> UserSettings:
    settings_obj = db.query(UserSettings).filter(
        UserSettings.user_id == user_id
    ).first()

    if not settings_obj:
        settings_obj = UserSettings(user_id=user_id)
        try:
            db.add(settings_obj)
            db.commit()
            db.refresh(settings_obj)
        except Exception as e:
            db.rollback()
            logger.error(f"Settings create error: {e}")
            raise HTTPException(status_code=500, detail="Could not create settings")

    return settings_obj

def update_settings(
    db: Session,
    user_id: str,
    data: SettingsUpdate
) -> UserSettings:
    settings_obj = get_or_create_settings(db, user_id)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings_obj, field, value)

    try:
        db.commit()
        db.refresh(settings_obj)
        return settings_obj
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not update settings")

def change_password(
    db: Session,
    user_id: str,
    data: ChangePasswordRequest
) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    user.hashed_password = hash_password(data.new_password)

    try:
        db.commit()
        logger.info(f"Password changed for user: {user_id}")
        return {"message": "Password changed successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not change password")

def get_connected_accounts(db: Session, user_id: str) -> list:
    accounts = db.query(ConnectedAccount).filter(
        ConnectedAccount.user_id == user_id
    ).all()

    # Return all 3 platforms always, even if not connected
    platforms = ["linkedin", "github", "leetcode"]
    result = []

    connected_map = {a.platform: a for a in accounts}

    for platform in platforms:
        if platform in connected_map:
            result.append(connected_map[platform])
        else:
            result.append(ConnectedAccount(
                id=str(__import__('uuid').uuid4()),
                user_id=user_id,
                platform=platform,
                connected=False
            ))

    return result

def disconnect_account(db: Session, user_id: str, platform: str) -> dict:
    account = db.query(ConnectedAccount).filter(
        ConnectedAccount.user_id == user_id,
        ConnectedAccount.platform == platform
    ).first()

    if account:
        try:
            db.delete(account)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Could not disconnect account")

    return {"message": f"{platform} disconnected"}

def export_user_data(db: Session, user_id: str) -> dict:
    from app.models.profile import UserSkill, UserExperience, UserEducation
    from app.models.preferences import UserPreference

    user = db.query(User).filter(User.id == user_id).first()
    skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
    experience = db.query(UserExperience).filter(UserExperience.user_id == user_id).all()
    education = db.query(UserEducation).filter(UserEducation.user_id == user_id).all()

    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "user": {
            "email": user.email if user else None,
            "name": user.full_name if user else None,
            "created_at": user.created_at.isoformat() if user else None
        },
        "skills": [{"name": s.name, "level": s.level} for s in skills],
        "experience": [{"title": e.title, "company": e.company} for e in experience],
        "education": [{"degree": e.degree, "school": e.school} for e in education],
        "message": "Your data export is ready."
    }

def delete_account(db: Session, user_id: str, password: str) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect password. Account not deleted."
        )

    try:
        db.delete(user)
        db.commit()
        logger.info(f"Account deleted: {user_id}")
        return {"message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not delete account")
