"""
Lead Intelligence Models
Tracks ad clicks and career roadmap requests for lead intelligence
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class AdClick(Base):
    """Track when users click on ads"""
    __tablename__ = "ad_clicks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    ad_id = Column(String, ForeignKey("ads.id"), nullable=False)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    
    clicked_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    ad = relationship("Ad")
    university = relationship("University")


class AdImpression(Base):
    """Track when ads are shown to users"""
    __tablename__ = "ad_impressions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    ad_id = Column(String, ForeignKey("ads.id"), nullable=False)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    ad = relationship("Ad")
    university = relationship("University")


class CareerRoadmapRequest(Base):
    """Track career roadmap generation requests"""
    __tablename__ = "career_roadmap_requests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    
    career_goal = Column(String, nullable=False)  # e.g., "Tech Lead", "VP Engineering"
    current_position = Column(String, default=None)
    target_position = Column(String, nullable=False)
    experience_level = Column(String, default=None)  # "entry", "mid", "senior", "executive"
    industry = Column(String, default=None)
    
    # Additional preferences stored as JSON
    preferences = Column(JSON, default=None)
    
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    university = relationship("University")


class CareerRoadmapView(Base):
    """Track when users view career roadmaps"""
    __tablename__ = "career_roadmap_views"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    roadmap_request_id = Column(String, ForeignKey("career_roadmap_requests.id"), nullable=True)
    career_goal = Column(String, nullable=False)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    roadmap_request = relationship("CareerRoadmapRequest")
    university = relationship("University")

