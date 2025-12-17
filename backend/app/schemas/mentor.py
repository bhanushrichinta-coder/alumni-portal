from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MentorProfileCreate(BaseModel):
    """Create mentor profile schema."""
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    expertise: Optional[List[str]] = None
    bio: Optional[str] = None
    availability: str = "Medium"  # High, Medium, Low
    years_experience: int = 0


class MentorProfileUpdate(BaseModel):
    """Update mentor profile schema."""
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    expertise: Optional[List[str]] = None
    bio: Optional[str] = None
    availability: Optional[str] = None
    years_experience: Optional[int] = None
    is_active: Optional[bool] = None


class MentorUserResponse(BaseModel):
    """Mentor user info."""
    id: str
    name: str
    avatar: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[int] = None


class MentorProfileResponse(BaseModel):
    """Mentor profile response schema."""
    id: str
    user: MentorUserResponse
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    expertise: Optional[List[str]] = None
    bio: Optional[str] = None
    availability: str
    mentees: int  # mentees_count
    years_experience: int
    match_score: int
    is_active: bool
    
    class Config:
        from_attributes = True


class MentorMatchCreate(BaseModel):
    """Create mentor match schema."""
    mentor_profile_id: str


class MentorMatchResponse(BaseModel):
    """Mentor match response schema."""
    id: str
    mentor: MentorProfileResponse
    match_score: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class MentorListResponse(BaseModel):
    """List of mentors response."""
    mentors: List[MentorProfileResponse]
    total: int
    page: int
    page_size: int

