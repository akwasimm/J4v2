"""
Unified AI client with fallback support.
Tries GROQ first, falls back to NVIDIA NIM if GROQ fails.
"""

import logging
from typing import List, Dict, Any, Optional
import requests

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIClient:
    """Unified AI client with automatic fallback between providers."""
    
    def __init__(self):
        self.groq_key = settings.GROQ_API_KEY
        self.nvidia_key = settings.NVIDIA_NIM_API_KEY
        self.groq_model = settings.GROQ_MODEL
        self.nvidia_model = settings.NVIDIA_NIM_MODEL
        
    @property
    def is_configured(self) -> bool:
        """Check if at least one AI provider is configured."""
        return bool(self.groq_key or self.nvidia_key)
    
    @property
    def primary_provider(self) -> str:
        """Get the name of the primary provider."""
        if self.groq_key:
            return "groq"
        elif self.nvidia_key:
            return "nvidia_nim"
        return "none"
    
    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Get chat completion with automatic fallback.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            **kwargs: Additional parameters
            
        Returns:
            Dict with 'content', 'provider', and 'model' keys
            
        Raises:
            RuntimeError: If no AI provider is configured or all fail
        """
        # Try GROQ first if available
        if self.groq_key:
            try:
                result = self._call_groq(messages, max_tokens, temperature, **kwargs)
                logger.info(f"GROQ success: {result['model']}")
                return result
            except Exception as e:
                logger.warning(f"GROQ failed: {e}")
                # Fall through to NVIDIA
        
        # Try NVIDIA NIM as fallback
        if self.nvidia_key:
            try:
                result = self._call_nvidia(messages, max_tokens, temperature, **kwargs)
                logger.info(f"NVIDIA NIM success: {result['model']}")
                return result
            except Exception as e:
                logger.error(f"NVIDIA NIM failed: {e}")
        
        raise RuntimeError("No AI provider available or all providers failed")
    
    def _call_groq(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int,
        temperature: float,
        **kwargs
    ) -> Dict[str, Any]:
        """Call GROQ API."""
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        payload = {
            "model": self.groq_model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            **kwargs
        }
        
        response = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {self.groq_key}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            raise RuntimeError(f"GROQ API error: {response.status_code} - {response.text[:200]}")
        
        data = response.json()
        content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
        
        return {
            "content": content,
            "provider": "groq",
            "model": data.get('model', self.groq_model),
            "usage": data.get('usage', {})
        }
    
    def _call_nvidia(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int,
        temperature: float,
        **kwargs
    ) -> Dict[str, Any]:
        """Call NVIDIA NIM API."""
        url = "https://integrate.api.nvidia.com/v1/chat/completions"
        
        # Filter out unsupported kwargs for NVIDIA
        supported_kwargs = {k: v for k, v in kwargs.items() 
                         if k in ['top_p', 'frequency_penalty', 'presence_penalty']}
        
        payload = {
            "model": self.nvidia_model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            **supported_kwargs
        }
        
        response = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {self.nvidia_key}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            raise RuntimeError(f"NVIDIA API error: {response.status_code} - {response.text[:200]}")
        
        data = response.json()
        content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
        
        return {
            "content": content,
            "provider": "nvidia_nim",
            "model": data.get('model', self.nvidia_model),
            "usage": data.get('usage', {})
        }
    
    def test_providers(self) -> Dict[str, bool]:
        """Test both providers and return status."""
        results = {"groq": False, "nvidia_nim": False}
        
        test_message = [{"role": "user", "content": "Say 'OK'"}]
        
        # Test GROQ
        if self.groq_key:
            try:
                self._call_groq(test_message, max_tokens=5, temperature=0.1)
                results["groq"] = True
            except Exception as e:
                logger.warning(f"GROQ test failed: {e}")
        
        # Test NVIDIA
        if self.nvidia_key:
            try:
                self._call_nvidia(test_message, max_tokens=5, temperature=0.1)
                results["nvidia_nim"] = True
            except Exception as e:
                logger.warning(f"NVIDIA test failed: {e}")
        
        return results


# Global AI client instance
ai_client = AIClient()
