"""
Application configuration using Pydantic Settings.
"""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator, ConfigDict, ValidationInfo


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str
    
    # JWT Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AI Providers
    GROQ_API_KEY: Optional[str] = None
    NVIDIA_NIM_API_KEY: Optional[str] = None
    NVIDIA_NIM_MODEL: str = "meta/llama-3.1-8b-instruct"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    
    # App
    APP_NAME: str = "JobFor API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Computed properties
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string into list."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]
    
    @property
    def max_file_size_bytes(self) -> int:
        """Convert MB to bytes."""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024
    
    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_must_be_long(cls, v: str) -> str:
        """Validate SECRET_KEY must be at least 32 characters."""
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters")
        return v
    
    @field_validator("DATABASE_URL")
    @classmethod
    def database_url_must_be_postgres(cls, v: str) -> str:
        """Validate DATABASE_URL is a PostgreSQL URL."""
        if not v.startswith("postgresql"):
            raise ValueError("DATABASE_URL must be a PostgreSQL URL")
        return v
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )


# Create global settings instance
settings = Settings()
