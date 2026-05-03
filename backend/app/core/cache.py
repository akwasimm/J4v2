"""
Caching layer using in-memory LRU cache (for single-instance) or Redis (for multi-instance).
Falls back to in-memory if Redis is unavailable.
"""

import json
import hashlib
import logging
from typing import Optional, Any, Callable
from functools import wraps
from datetime import datetime, timedelta
from dataclasses import dataclass

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

try:
    from functools import lru_cache
except ImportError:
    from functools import lru_cache

from app.core.config import settings

logger = logging.getLogger(__name__)

# In-memory cache fallback (per-process, thread-safe)
_memory_cache = {}
_cache_expiry = {}

def _get_cache_key(prefix: str, *args, **kwargs) -> str:
    """Generate a cache key from function arguments."""
    key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
    hash_key = hashlib.md5(key_data.encode()).hexdigest()
    return f"{prefix}:{hash_key}"


class CacheManager:
    """Unified cache manager supporting Redis and in-memory fallback."""
    
    def __init__(self):
        self._redis: Optional[Any] = None
        self._redis_enabled = False
        self._init_redis()
    
    def _init_redis(self):
        """Initialize Redis connection if available."""
        if not REDIS_AVAILABLE:
            logger.info("Redis not available, using in-memory cache")
            return
        
        try:
            redis_url = getattr(settings, 'REDIS_URL', None)
            if redis_url:
                self._redis = redis.from_url(redis_url, decode_responses=True)
                self._redis.ping()
                self._redis_enabled = True
                logger.info("Redis cache initialized")
        except Exception as e:
            logger.warning(f"Redis connection failed, using in-memory cache: {e}")
            self._redis = None
            self._redis_enabled = False
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            if self._redis_enabled and self._redis:
                data = self._redis.get(key)
                if data:
                    return json.loads(data)
                return None
            else:
                # In-memory cache
                if key in _cache_expiry and _cache_expiry[key] < datetime.utcnow():
                    del _memory_cache[key]
                    del _cache_expiry[key]
                    return None
                return _memory_cache.get(key)
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        """Set value in cache with TTL."""
        try:
            if self._redis_enabled and self._redis:
                self._redis.setex(key, ttl_seconds, json.dumps(value, default=str))
            else:
                # In-memory cache
                _memory_cache[key] = value
                _cache_expiry[key] = datetime.utcnow() + timedelta(seconds=ttl_seconds)
                
                # Cleanup old entries if cache grows too large (>1000 entries)
                if len(_memory_cache) > 1000:
                    self._cleanup_memory_cache()
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    def delete(self, key: str):
        """Delete value from cache."""
        try:
            if self._redis_enabled and self._redis:
                self._redis.delete(key)
            else:
                _memory_cache.pop(key, None)
                _cache_expiry.pop(key, None)
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
    
    def delete_pattern(self, pattern: str):
        """Delete all keys matching pattern (Redis only)."""
        try:
            if self._redis_enabled and self._redis:
                for key in self._redis.scan_iter(match=pattern):
                    self._redis.delete(key)
        except Exception as e:
            logger.error(f"Cache delete pattern error: {e}")
    
    def _cleanup_memory_cache(self):
        """Remove expired entries from memory cache."""
        now = datetime.utcnow()
        expired_keys = [
            k for k, v in _cache_expiry.items() 
            if v < now
        ]
        for k in expired_keys:
            _memory_cache.pop(k, None)
            _cache_expiry.pop(k, None)
        
        # If still too large, remove oldest entries
        if len(_memory_cache) > 1000:
            sorted_keys = sorted(_cache_expiry.items(), key=lambda x: x[1])
            for k, _ in sorted_keys[:100]:  # Remove oldest 100
                _memory_cache.pop(k, None)
                _cache_expiry.pop(k, None)


# Global cache instance
cache = CacheManager()


def cached(prefix: str, ttl_seconds: int = 300):
    """Decorator to cache function results."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Skip caching if explicitly disabled
            if kwargs.pop('_skip_cache', False):
                return func(*args, **kwargs)
            
            cache_key = _get_cache_key(prefix, func.__name__, *args, **kwargs)
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached_value
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl_seconds)
            return result
        
        # Attach cache helper methods
        wrapper.cache_delete = lambda *a, **kw: cache.delete(_get_cache_key(prefix, func.__name__, *a, **kw))
        wrapper.cache_clear = lambda: cache.delete_pattern(f"{prefix}:*")
        
        return wrapper
    return decorator


def invalidate_cache_pattern(pattern: str):
    """Invalidate all cache entries matching pattern."""
    cache.delete_pattern(pattern)


# Specific cache helpers for common patterns
def cache_job_search(user_id: Optional[str], params_dict: dict, result: Any, ttl: int = 60):
    """Cache job search results."""
    key = _get_cache_key("job_search", user_id or "anon", params_dict)
    cache.set(key, result, ttl)

def get_cached_job_search(user_id: Optional[str], params_dict: dict) -> Optional[Any]:
    """Get cached job search results."""
    key = _get_cache_key("job_search", user_id or "anon", params_dict)
    return cache.get(key)

def invalidate_job_search_cache():
    """Invalidate all job search caches (call when jobs are added/updated)."""
    cache.delete_pattern("job_search:*")
