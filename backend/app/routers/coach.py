"""
Career Coach Router - Chat sessions and messaging.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user_id, require_groq
from app.schemas.ai_pages import (
    CoachMessageCreate, CoachSessionResponse,
    CoachChatResponse, CoachSessionCreate
)
from app.schemas.common import SuccessResponse

router = APIRouter()

@router.get("/sessions", response_model=List[CoachSessionResponse])
def get_sessions(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.coach_service import get_user_sessions
    return get_user_sessions(db, user_id)

@router.get("/sessions/{session_uuid}", response_model=CoachSessionResponse)
def get_session(
    session_uuid: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.coach_service import get_session_with_messages
    return get_session_with_messages(db, user_id, session_uuid)

@router.post("/chat", response_model=CoachChatResponse)
def send_message(
    data: CoachMessageCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    _: str = Depends(require_groq)
):
    from app.services.coach_service import send_message as _send
    return _send(db, user_id, data.content, data.session_id)

@router.delete("/sessions/{session_uuid}", response_model=SuccessResponse)
def delete_session(
    session_uuid: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    from app.services.coach_service import delete_session as _delete
    _delete(db, user_id, session_uuid)
    return SuccessResponse(message="Session deleted")
