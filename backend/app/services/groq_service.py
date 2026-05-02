"""
Central service for all Groq AI calls.
"""

import logging
import json
from typing import Optional, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


# ============================================
# ✅ MODULE-LEVEL CLIENT - importable anywhere
# ============================================

if not settings.GROQ_API_KEY:
    logger.warning("GROQ_API_KEY not set - AI features disabled")
    client = None  # ✅ Still defined, just None
else:
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)  # ✅ Module level
        logger.info("Groq client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Groq client: {e}")
        client = None  # ✅ Still defined, never raises ImportError


def is_groq_available() -> bool:
    """Check if Groq client is ready to use"""
    return client is not None


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
    expect_json: bool = True,
    use_fallback: bool = True
) -> Optional[str]:
    """
    Core Groq API call function with automatic fallback to free model.
    Returns raw response text or None on failure.
    
    Args:
        use_fallback: If True, will try fallback models (compound-mini -> compound -> llama-3.1-8b-instant) on errors
    """
    # Use module-level client if available, otherwise try to get one
    groq_client = client if client else get_groq_client()
    if not groq_client:
        logger.error("Groq client not available")
        return None
    
    # Use model from settings if not specified
    primary_model = model if model else settings.GROQ_MODEL
    # Fallback chain: compound-mini (70K tokens/min) -> compound -> llama-3.1-8b-instant
    fallback_models = ["groq/compound-mini", "groq/compound", "llama-3.1-8b-instant"]
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt}
    ]
    
    def _make_call(model_name: str) -> Optional[str]:
        """Helper to make a single API call."""
        try:
            kwargs = {
                "model": model_name,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            
            if expect_json:
                kwargs["response_format"] = {"type": "json_object"}
            
            response = groq_client.chat.completions.create(**kwargs)
            content = response.choices[0].message.content
            
            logger.info(f"Groq call successful with {model_name}. Tokens: {response.usage.total_tokens}")
            return content
            
        except Exception as e:
            error_str = str(e).lower()
            # Check for rate limit or quota exceeded errors
            if any(err in error_str for err in ['rate_limit', 'quota', 'limit exceeded', '429']):
                logger.warning(f"Rate limit hit with {model_name}: {e}")
                raise RateLimitError(f"Rate limit: {e}")
            logger.error(f"Groq API call failed with {model_name}: {e}")
            return None
    
    # Try primary model first
    try:
        result = _make_call(primary_model)
        if result:
            return result
    except RateLimitError:
        if use_fallback:
            for fallback in fallback_models:
                logger.info(f"Rate limit hit, trying fallback: {fallback}")
                result = _make_call(fallback)
                if result:
                    return result
    
    # If primary failed (not rate limit) and fallback is enabled, try fallbacks
    if use_fallback:
        for fallback in fallback_models:
            logger.info(f"Primary failed, trying fallback: {fallback}")
            result = _make_call(fallback)
            if result:
                return result
    
    return None


class RateLimitError(Exception):
    """Exception raised when rate limit is hit."""
    pass


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
