from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AuthorResponse(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: str
    author: AuthorResponse
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    type: str = "text"
    content: str
    media_url: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tag: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None


class PostUpdate(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    tag: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None


class PostResponse(BaseModel):
    id: str
    author: AuthorResponse
    type: str
    content: str
    media_url: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tag: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    likes_count: int = 0
    comments_count: int = 0
    shares_count: int = 0
    is_liked: bool = False
    can_edit: bool = False  # Whether current user can edit this post
    can_delete: bool = False  # Whether current user can delete this post
    time: str
    created_at: datetime

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total: int
    page: int
    page_size: int
