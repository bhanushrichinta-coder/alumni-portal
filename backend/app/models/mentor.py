import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Mentor(Base):
    __tablename__ = "mentors"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    
    title = Column(String, default=None)
    company = Column(String, default=None)
    location = Column(String, default=None)
    bio = Column(Text, default=None)
    
    expertise = Column(Text, default="[]")  # JSON array as string
    availability = Column(String, default="Medium")  # High, Medium, Low
    
    years_experience = Column(Integer, default=0)
    mentees_count = Column(Integer, default=0)
    match_score = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User")


class MentorMatch(Base):
    __tablename__ = "mentor_matches"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    mentor_id = Column(String, ForeignKey("mentors.id"), nullable=False)
    mentee_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    status = Column(String, default="matched")  # matched, active, completed
    
    matched_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    mentor = relationship("Mentor")
    mentee = relationship("User")
