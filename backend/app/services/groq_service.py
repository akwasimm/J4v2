"""
Central service for all Groq AI calls.
"""

import logging
import json
from typing import Optional, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


def get_groq_client():
    """Get Groq client. Returns None if not configured."""
    if not settings.GROQ_API_KEY:
        return None
    try:
        from groq import Groq
        return Groq(api_key=settings.GROQ_API_KEY)
    except ImportError:
        logger.error("Groq SDK not installed")
        return None
    except Exception as e:
        logger.error(f"Could not initialize Groq client: {e}")
        return None


def call_groq(
    prompt: str,
    system_prompt: str = "You are a helpful AI assistant.",
    model: str = None,
    temperature: float = 0.1,
    max_tokens: int = 4000,
    expect_json: bool = True
) -> Optional[str]:
    """
    Core Groq API call function.
    Returns raw response text or None on failure.
    """
    client = get_groq_client()
    if not client:
        logger.error("Groq client not available")
        return None
    
    # Use model from settings if not specified
    if model is None:
        model = settings.GROQ_MODEL
    
    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        kwargs = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        
        if expect_json:
            kwargs["response_format"] = {"type": "json_object"}
        
        response = client.chat.completions.create(**kwargs)
        content = response.choices[0].message.content
        
        logger.info(f"Groq call successful. Tokens used: {response.usage.total_tokens}")
        return content
        
    except Exception as e:
        logger.error(f"Groq API call failed: {e}")
        return None


def parse_json_response(response_text: str) -> Optional[dict]:
    """
    Safely parse JSON from Groq response.
    Handles cases where model wraps JSON in markdown code blocks.
    """
    if not response_text:
        return None
    
    text = response_text.strip()
    
    # Remove markdown code blocks if present
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    
    text = text.strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed: {e}")
        logger.error(f"Raw response: {text[:500]}")
        return None


def call_groq_json(
    prompt: str,
    system_prompt: str,
    model: str = None,
    temperature: float = 0.1,
    max_tokens: int = 4000
) -> Optional[dict]:
    """
    Call Groq and return parsed JSON dict.
    Returns None if call fails or JSON is invalid.
    """
    response = call_groq(
        prompt=prompt,
        system_prompt=system_prompt,
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        expect_json=True
    )
    
    if not response:
        return None
    
    return parse_json_response(response)
