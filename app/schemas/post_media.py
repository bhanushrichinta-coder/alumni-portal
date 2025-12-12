"""
Post media schemas
"""
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.post_media import MediaType


class PostMediaBase(BaseModel):
    """Base post media schema"""
    media_type: MediaType
    file_path: str
    file_name: str
    file_size: int
    mime_type: str
    thumbnail_path: Optional[str] = None
    order: int = 0


class PostMediaResponse(PostMediaBase):
    """Post media response schema"""
    id: int
    post_id: int
    media_url: str  # URL to access the media file
    thumbnail_url: Optional[str] = None  # URL to access thumbnail (for videos)

    model_config = ConfigDict(from_attributes=True)

