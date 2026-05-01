"""
Career Coach Service - Handles chat sessions and AI-powered coaching conversations.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from app.models.coach import CoachSession, CoachMessage
from app.models.user import User
from app.services.groq_service import call_groq
from app.services.ai_pages_service import get_user_profile_summary

logger = logging.getLogger(__name__)

COACH_SYSTEM_PROMPT = """You are Lume, an expert AI career coach for JobFor platform. You help tech 
professionals in India navigate their careers.

Your expertise includes:
- Resume and profile optimization
- Interview preparation and tips
- Salary negotiation strategies
- Career path planning
- Skill development roadmaps
- Indian IT job market insights
- Company-specific advice for Indian tech companies

Personality:
- Supportive, encouraging, and realistic
- Give specific, actionable advice not generic tips
- Use data and examples when possible
- Keep responses focused and practical
- Format with bullet points or numbered lists when appropriate
- Responses should be 150-400 words unless user asks for more detail

Always remember the user's profile context shared at the start.
"""

def get_or_create_session(
    db: Session,
    user_id: str,
    session_uuid: Optional[str] = None
) -> CoachSession:

    if session_uuid:
        session = db.query(CoachSession).filter(
            CoachSession.session_uuid == session_uuid,
            CoachSession.user_id == user_id
        ).first()
        if session:
            return session

    # Create new session
    new_uuid = session_uuid or str(uuid.uuid4())
    session = CoachSession(
        session_uuid=new_uuid,
        user_id=user_id,
        title="New Conversation",
        context="general",
        message_count=0,
        is_active=True
    )

    try:
        db.add(session)
        db.commit()
        db.refresh(session)
        return session
    except Exception as e:
        db.rollback()
        logger.error(f"Session create error: {e}")
        raise HTTPException(status_code=500, detail="Could not create session")

def get_user_sessions(db: Session, user_id: str) -> List[CoachSession]:
    return db.query(CoachSession).filter(
        CoachSession.user_id == user_id
    ).order_by(CoachSession.updated_at.desc()).limit(20).all()

def get_session_with_messages(
    db: Session,
    user_id: str,
    session_uuid: str
) -> CoachSession:
    session = db.query(CoachSession).options(
        joinedload(CoachSession.messages)
    ).filter(
        CoachSession.session_uuid == session_uuid,
        CoachSession.user_id == user_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session

def send_message(
    db: Session,
    user_id: str,
    content: str,
    session_uuid: Optional[str] = None
) -> dict:

    # Get or create session
    session = get_or_create_session(db, user_id, session_uuid)

    # Get conversation history (last 10 messages for context)
    history = db.query(CoachMessage).filter(
        CoachMessage.session_id == session.id
    ).order_by(CoachMessage.created_at.desc()).limit(10).all()
    history = list(reversed(history))

    # Get user profile for context (only on first message)
    profile_context = ""
    if not history:
        profile = get_user_profile_summary(db, user_id)
        profile_context = f"""
User Profile Context:
- Name: {profile.get('name', 'User')}
- Headline: {profile.get('headline', 'Not set')}
- Location: {profile.get('location', 'Not set')}
- Skills: {', '.join(profile.get('skills', [])[:10])}
- Experience: {profile.get('experience', 'Not listed')}

---
"""

    # Build messages for Groq
    from groq import Groq
    from app.core.config import settings

    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured"
        )

    client = Groq(api_key=settings.GROQ_API_KEY)

    messages = [
        {"role": "system", "content": COACH_SYSTEM_PROMPT + profile_context}
    ]

    # Add history
    for msg in history:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })

    # Add current message
    messages.append({"role": "user", "content": content})

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        assistant_content = response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq coach call failed: {e}")
        raise HTTPException(
            status_code=503,
            detail="AI service temporarily unavailable. Try again."
        )

    # Save user message
    user_msg = CoachMessage(
        session_id=session.id,
        user_id=user_id,
        role="user",
        content=content
    )
    db.add(user_msg)

    # Save assistant message
    assistant_msg = CoachMessage(
        session_id=session.id,
        user_id=user_id,
        role="assistant",
        content=assistant_content
    )
    db.add(assistant_msg)

    # Update session
    session.message_count = (session.message_count or 0) + 2
    session.updated_at = datetime.now(timezone.utc)

    # Auto-generate title from first user message
    if session.message_count == 2 and len(content) > 5:
        session.title = content[:60] + ("..." if len(content) > 60 else "")

    try:
        db.commit()
        db.refresh(user_msg)
        db.refresh(assistant_msg)
        db.refresh(session)
    except Exception as e:
        db.rollback()
        logger.error(f"Message save error: {e}")
        raise HTTPException(status_code=500, detail="Could not save messages")

    return {
        "session_id": session.session_uuid,  # Return UUID as the primary session identifier
        "session_uuid": session.session_uuid,
        "user_message": user_msg,
        "assistant_message": assistant_msg
    }

def delete_session(db: Session, user_id: str, session_uuid: str):
    session = db.query(CoachSession).filter(
        CoachSession.session_uuid == session_uuid,
        CoachSession.user_id == user_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        db.delete(session)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not delete session")
