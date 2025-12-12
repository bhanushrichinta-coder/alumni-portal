"""
Feed models for posts, comments, and likes
"""
from sqlalchemy import Column, String, Text, Integer, ForeignKey, Boolean, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import relationship
import enum
from app.db.base import BaseModel


class PostStatus(str, enum.Enum):
    """Post status enum"""
    ACTIVE = "active"
    DELETED = "deleted"
    HIDDEN = "hidden"  # Hidden by admin but not deleted


class PostTag(str, enum.Enum):
    """Post tag enum"""
    SUCCESS_STORY = "success_story"
    CAREER_MILESTONE = "career_milestone"
    ACHIEVEMENT = "achievement"
    LEARNING_JOURNEY = "learning_journey"
    VOLUNTEERING = "volunteering"


class Post(BaseModel):
    """Post model for feed"""
    __tablename__ = "posts"

    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    university_id = Column(Integer, ForeignKey("universities.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(SQLEnum(PostStatus), default=PostStatus.ACTIVE, nullable=False, index=True)
    is_pinned = Column(Boolean, default=False, nullable=False)
    # New fields for filtering
    tag = Column(SQLEnum(PostTag), nullable=True, index=True)  # Tag for post categorization
    company = Column(String(255), nullable=True, index=True)  # Company name (for job posts/career updates)
    
    # Relationships
    author = relationship("User", foreign_keys=[author_id])
    university = relationship("University")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan", order_by="Comment.created_at")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")
    media = relationship("PostMedia", back_populates="post", cascade="all, delete-orphan", order_by="PostMedia.order")


class Comment(BaseModel):
    """Comment model for post comments"""
    __tablename__ = "comments"

    content = Column(Text, nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(SQLEnum(PostStatus), default=PostStatus.ACTIVE, nullable=False)
    
    # Relationships
    post = relationship("Post", back_populates="comments")
    author = relationship("User", foreign_keys=[author_id])


class Like(BaseModel):
    """Like model for post likes"""
    __tablename__ = "likes"

    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Relationships
    post = relationship("Post", back_populates="likes")
    user = relationship("User", foreign_keys=[user_id])
    
    # Unique constraint: one like per user per post
    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='uq_like_post_user'),
    )

