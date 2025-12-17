from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UniversityBrandingColors(BaseModel):
    """Branding colors for a theme mode."""
    primary: str
    secondary: str
    accent: str


class UniversityBrandingUpdate(BaseModel):
    """Update university branding."""
    light_primary: Optional[str] = None
    light_secondary: Optional[str] = None
    light_accent: Optional[str] = None
    dark_primary: Optional[str] = None
    dark_secondary: Optional[str] = None
    dark_accent: Optional[str] = None


class UniversityBrandingResponse(BaseModel):
    """University branding response."""
    light: UniversityBrandingColors
    dark: UniversityBrandingColors

    class Config:
        from_attributes = True


class UniversityBase(BaseModel):
    """Base university schema."""
    name: str
    logo: Optional[str] = None


class UniversityCreate(UniversityBase):
    """Create university schema."""
    pass


class UniversityUpdate(BaseModel):
    """Update university schema."""
    name: Optional[str] = None
    logo: Optional[str] = None
    is_enabled: Optional[bool] = None


class UniversityResponse(BaseModel):
    """University response schema."""
    id: str
    name: str
    logo: Optional[str] = None
    is_enabled: bool = True
    colors: Optional[UniversityBrandingResponse] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class UniversityListResponse(BaseModel):
    """List of universities response."""
    universities: List[UniversityResponse]
    total: int

