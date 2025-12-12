import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class PostType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    JOB = "job"
    ANNOUNCEMENT = "announcement"


class PostTag(str, Enum):
    SUCCESS_STORY = "success-story"
    CAREER_MILESTONE = "career-milestone"
    ACHIEVEMENT = "achievement"
    LEARNING = "learning"
    VOLUNTEERING = "volunteering"


class Post(Base):
    __tablename__ = "posts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    
    type = Column(SQLEnum(PostType), default=PostType.TEXT)
    content = Column(Text, nullable=False)
    media_url = Column(String, default=None)
    video_url = Column(String, default=None)
    thumbnail_url = Column(String, default=None)
    tag = Column(String, default=None)
    
    # For job posts
    job_title = Column(String, default=None)
    company = Column(String, default=None)
    location = Column(String, default=None)
    
    # Stats
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User")
    university = relationship("University")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = Column(String, ForeignKey("posts.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    post = relationship("Post", back_populates="comments")
    author = relationship("User")


class Like(Base):
    __tablename__ = "likes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = Column(String, ForeignKey("posts.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    post = relationship("Post", back_populates="likes")
    user = relationship("User")
