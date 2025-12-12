"""
Post media models for images and videos
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.base import BaseModel


class MediaType(str, enum.Enum):
    """Media type enum"""
    IMAGE = "image"
    VIDEO = "video"


class PostMedia(BaseModel):
    """Post media model for storing images and videos"""
    __tablename__ = "post_media"

    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    media_type = Column(SQLEnum(MediaType), nullable=False, index=True)
    file_path = Column(String(512), nullable=False)  # Path to stored file
    file_name = Column(String(255), nullable=False)  # Original filename
    file_size = Column(Integer, nullable=False)  # File size in bytes
    mime_type = Column(String(100), nullable=False)  # MIME type (e.g., image/jpeg, video/mp4)
    thumbnail_path = Column(String(512), nullable=True)  # Optional thumbnail for videos
    order = Column(Integer, default=0, nullable=False)  # Order of media in post (for multiple media)

    # Relationships
    post = relationship("Post", back_populates="media")
