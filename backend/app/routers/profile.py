"""
Profile router.
"""

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


@router.get("/preferences", response_model=PreferencesResponse)
def get_preferences(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import get_preferences
    result = get_preferences(db, user_id)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Preferences not set")
    return result


@router.put("/preferences", response_model=PreferencesResponse)
def update_preferences(
    data: PreferencesUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.profile_service import upsert_preferences
    return upsert_preferences(db, user_id, data)
