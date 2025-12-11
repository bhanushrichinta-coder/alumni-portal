"""
User schemas for API requests and responses
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator
from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user creation"""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for user update"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


class UserInDB(UserBase):
    """User schema with database fields"""
    id: int
    is_active: bool
    is_verified: bool
    role: str  # Stored as string in DB, can be UserRole enum value
    university_id: Optional[int] = None  # Associated university
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserResponse(UserInDB):
    """User response schema"""
    pass


class UserLogin(BaseModel):
    """Schema for user login - accepts username or email"""
    # Support both 'username' and 'email' fields for backward compatibility
    # Frontend can send either field, and we'll use whichever is provided
    username: Optional[str] = Field(default=None, description="Username or email for login")
    email: Optional[str] = Field(default=None, description="Email for login (alternative to username)")
    password: str
    website_template: Optional[str] = Field(default=None)  # Optional template selection for admins
    
    @model_validator(mode='before')
    @classmethod
    def normalize_identifier(cls, data):
        """Normalize username/email before validation"""
        if isinstance(data, dict):
            # If email is provided but username is not, copy email to username
            if 'email' in data and data.get('email') and not data.get('username'):
                data['username'] = data['email']
            # If username is provided but email is not, that's fine too
        return data
    
    @model_validator(mode='after')
    def validate_identifier(self):
        """Ensure at least one of username or email is provided"""
        if not self.username and not self.email:
            raise ValueError("Either username or email must be provided")
        return self
    
    def get_identifier(self) -> str:
        """Get the login identifier (username or email)"""
        if self.username:
            return self.username
        if self.email:
            return self.email
        raise ValueError("Either username or email must be provided")
    
    model_config = ConfigDict(extra='forbid')


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    website_template: Optional[str] = None  # Template associated with admin user


class TokenData(BaseModel):
    """Token data schema"""
    user_id: Optional[int] = None
    username: Optional[str] = None


