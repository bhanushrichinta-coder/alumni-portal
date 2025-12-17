from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    avatar: Optional[str] = None
    read: bool = False
    time: str
    created_at: datetime
    action_url: Optional[str] = None
    related_id: Optional[str] = None

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    page_size: int
