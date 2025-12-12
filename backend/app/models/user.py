import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class UserRole(str, Enum):
    ALUMNI = "alumni"
    ADMIN = "admin"
    SUPERADMIN = "superadmin"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    avatar = Column(String, default=None)
    
    university_id = Column(String, ForeignKey("universities.id"), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    major = Column(String, nullable=True)
    
    role = Column(SQLEnum(UserRole), default=UserRole.ALUMNI)
    is_mentor = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Password reset
    password_reset_requested = Column(Boolean, default=False)
    password_reset_requested_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    university = relationship("University", back_populates="users")
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    
    bio = Column(Text, default=None)
    phone = Column(String, default=None)
    location = Column(String, default=None)
    job_title = Column(String, default=None)
    company = Column(String, default=None)
    linkedin = Column(String, default=None)
    website = Column(String, default=None)
    banner = Column(String, default=None)
    
    # Stats
    connections_count = Column(Integer, default=0)
    posts_count = Column(Integer, default=0)
    
    # Experience and Education (stored as JSON)
    experience = Column(Text, default="[]")  # JSON string
    education = Column(Text, default="[]")   # JSON string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="profile")
