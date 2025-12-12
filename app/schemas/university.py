"""
University schemas
"""
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class UniversityBrandingUpdate(BaseModel):
    """Schema for updating university branding"""
    logo_url: Optional[str] = Field(None, max_length=512, description="University logo URL")
    light_primary_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Light mode primary color (hex)")
    light_secondary_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Light mode secondary color (hex)")
    light_accent_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Light mode accent color (hex)")
    dark_primary_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Dark mode primary color (hex)")
    dark_secondary_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Dark mode secondary color (hex)")
    dark_accent_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Dark mode accent color (hex)")

    model_config = ConfigDict(extra='forbid')


class UniversityBrandingResponse(BaseModel):
    """Schema for university branding response"""
    logo_url: Optional[str] = None
    light_primary_color: Optional[str] = None
    light_secondary_color: Optional[str] = None
    light_accent_color: Optional[str] = None
    dark_primary_color: Optional[str] = None
    dark_secondary_color: Optional[str] = None
    dark_accent_color: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

