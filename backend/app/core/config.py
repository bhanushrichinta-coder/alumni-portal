from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Alumni Connect Hub API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # API settings
    API_V1_PREFIX: str = "/api/v1"
    
    # Security settings
    SECRET_KEY: str = "your-super-secret-key-change-in-production-please-make-it-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/alumni_connect_hub"
    
    # CORS settings
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
