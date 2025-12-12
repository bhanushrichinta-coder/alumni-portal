from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    """JWT Token response."""
    access_token: str
    token_type: str = "bearer"
    user: Optional[dict] = None


class TokenData(BaseModel):
    """Data encoded in JWT token."""
    sub: str  # user_id
    email: Optional[str] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request body."""
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    """Password reset request."""
    email: EmailStr


class PasswordResetResponse(BaseModel):
    """Password reset response."""
    success: bool
    message: str
    university_id: Optional[str] = None

