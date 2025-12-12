"""
Application configuration using Pydantic Settings
"""
from typing import List, Optional, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "Alumni Portal"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = Field(..., min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str
    DATABASE_URL_SYNC: str

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Vector Database
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    CHROMA_COLLECTION_NAME: str = "alumni_documents"

    # OpenAI (Optional - fallback)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536

    # Groq (FREE - for AI Chat)
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"  # Updated: llama-3.1-70b-versatile was decommissioned. Options: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768

    # Hugging Face (FREE - for Embeddings)
    HUGGINGFACE_API_KEY: Optional[str] = None
    HUGGINGFACE_EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"  # 384 dimensions, fast and free
    USE_LOCAL_EMBEDDINGS: bool = False  # If True, uses local sentence-transformers (no API needed)

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB (for documents and images)
    MAX_VIDEO_SIZE: int = 104857600  # 100MB (for videos)
    ALLOWED_EXTENSIONS: Union[List[str], str] = Field(default=["pdf", "doc", "docx", "txt", "md"])

    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None

    # CORS
    CORS_ORIGINS: Union[List[str], str] = Field(default=["*"])  # Allow all origins by default, can be restricted via env var
    CORS_ALLOW_CREDENTIALS: bool = True

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # Monitoring
    SENTRY_DSN: Optional[str] = None

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        if isinstance(v, list):
            return v
        return []

    @field_validator("ALLOWED_EXTENSIONS", mode="before")
    @classmethod
    def parse_allowed_extensions(cls, v):
        if isinstance(v, str):
            return [ext.strip() for ext in v.split(",") if ext.strip()]
        if isinstance(v, list):
            return v
        return []

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        json_schema_extra={
            "properties": {
                "CORS_ORIGINS": {"type": "array"},
                "ALLOWED_EXTENSIONS": {"type": "array"}
            }
        }
    )


# Global settings instance
settings = Settings()


