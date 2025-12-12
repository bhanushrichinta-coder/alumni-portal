from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_private: bool = False
    avatar: Optional[str] = None


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_private: Optional[bool] = None
    avatar: Optional[str] = None


class GroupResponse(BaseModel):
    id: str
    name: str
    members: int = 0
    description: Optional[str] = None
    is_private: bool = False
    category: Optional[str] = None
    avatar: Optional[str] = None
    is_joined: bool = False
    last_message: Optional[str] = None
    last_message_time: Optional[str] = None
    unread_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class GroupListResponse(BaseModel):
    groups: List[GroupResponse]
    total: int
    page: int
    page_size: int


class GroupMessageCreate(BaseModel):
    content: str


class GroupMessageSenderResponse(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = None


class GroupMessageResponse(BaseModel):
    id: str
    content: str
    sender: GroupMessageSenderResponse
    timestamp: str
    is_own: bool = False
    created_at: datetime

    class Config:
        from_attributes = True
