"""
Feed schemas for posts, comments, and likes
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
import enum
from app.models.feed import PostStatus
from app.schemas.post_media import PostMediaResponse


class PostTag(str, enum.Enum):
    """Post tag enum"""
    SUCCESS_STORY = "success_story"
    CAREER_MILESTONE = "career_milestone"
    ACHIEVEMENT = "achievement"
    LEARNING_JOURNEY = "learning_journey"
    VOLUNTEERING = "volunteering"


class PostBase(BaseModel):
    """Base post schema"""
    content: str = Field(..., min_length=1, max_length=10000)
    tag: Optional[PostTag] = Field(None, description="Post category tag")
    company: Optional[str] = Field(None, max_length=255, description="Company name (for job posts/career updates)")


class PostCreate(PostBase):
    """Schema for creating a post"""
    pass


class PostUpdate(BaseModel):
    """Schema for updating a post"""
    content: Optional[str] = Field(None, min_length=1, max_length=10000)
    tag: Optional[PostTag] = Field(None, description="Post category tag")
    company: Optional[str] = Field(None, max_length=255, description="Company name")


class CommentBase(BaseModel):
    """Base comment schema"""
    content: str = Field(..., min_length=1, max_length=5000)


class CommentCreate(CommentBase):
    """Schema for creating a comment"""
    pass


class CommentResponse(CommentBase):
    """Comment response schema"""
    id: int
    post_id: int
    author_id: int
    author_name: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LikeResponse(BaseModel):
    """Like response schema"""
    id: int
    post_id: int
    user_id: int
    user_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PostResponse(PostBase):
    """Post response schema"""
    id: int
    author_id: int
    author_name: Optional[str] = None
    university_id: Optional[int] = None
    university_name: Optional[str] = None
    status: str
    is_pinned: bool
    tag: Optional[str] = None  # Tag value as string
    company: Optional[str] = None
    likes_count: int = 0
    comments_count: int = 0
    user_liked: bool = False
    media: List[PostMediaResponse] = []  # List of media files (images/videos)
    created_at: datetime
    updated_at: datetime
    comments: List[CommentResponse] = []
    likes: List[LikeResponse] = []

    model_config = ConfigDict(from_attributes=True)


class PostListResponse(BaseModel):
    """Post list response with pagination"""
    posts: List[PostResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


