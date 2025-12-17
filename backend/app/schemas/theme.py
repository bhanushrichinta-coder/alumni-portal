from pydantic import BaseModel


class ThemeUpdate(BaseModel):
    """Update theme schema."""
    theme: str  # "light" or "dark"


class ThemeResponse(BaseModel):
    """Theme response schema."""
    theme: str
    
    class Config:
        from_attributes = True

