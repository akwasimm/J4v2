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


# Removed: /profile/parse-resume, /profile/update-from-resume and
# /profile/ai-preview, with app/services/profile_page_service.py (849 lines).
# All three called .get() on the ORM object returned by get_full_profile(),
# so every request raised AttributeError and returned HTTP 200 with
# success:false. They had no frontend caller, were gated behind a Groq key
# that is not configured, and made unmetered AI calls. Reachable from git
# history if a resume-to-profile workflow is ever wanted.
#
# Kept deliberately: /jobs/collections (a coherent feature, no AI cost, no
# defect) and /profile/resume/{id}/reparse (pairs with the resume routes that
# are wired up). Both remain without a frontend caller - a known gap, not
# broken code.

