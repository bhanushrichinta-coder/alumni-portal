import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Ad(Base):
    __tablename__ = "ads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Content
    title = Column(String, nullable=False)
    description = Column(Text, default=None)
    
    # Media - supports both image and video
    media_url = Column(String, nullable=False)  # URL to image or video
    media_type = Column(String, default="image")  # 'image' or 'video'
    
    # Link when user clicks "Learn More"
    link_url = Column(String, default=None)
    
    # Placement options: 'left-sidebar', 'right-sidebar', 'feed'
    placement = Column(String, default="feed")
    
    # Target universities - JSON string: '["all"]' or '["mit", "stanford"]'
    target_universities = Column(Text, default='["all"]')
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Legacy fields for backward compatibility
    image = Column(String, nullable=True)  # Deprecated, use media_url
    link = Column(String, nullable=True)  # Deprecated, use link_url
    type = Column(String, default="general")  # Legacy type field
    university_id = Column(String, ForeignKey("universities.id"), nullable=True)  # Single university (deprecated)
    
    # Analytics
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    university = relationship("University", back_populates="ads")
