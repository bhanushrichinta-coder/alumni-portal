from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image: Optional[str] = None
    event_date: str
    event_time: Optional[str] = None
    location: Optional[str] = None
    is_virtual: bool = False
    meeting_link: Optional[str] = None
    category: Optional[str] = None
    max_attendees: Optional[int] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    location: Optional[str] = None
    is_virtual: Optional[bool] = None
    meeting_link: Optional[str] = None
    category: Optional[str] = None
    max_attendees: Optional[int] = None
    is_active: Optional[bool] = None


class EventResponse(BaseModel):
    id: str
    title: str
    date: str
    time: Optional[str] = None
    location: Optional[str] = None
    attendees: int = 0
    image: Optional[str] = None
    description: Optional[str] = None
    is_virtual: bool = False
    meeting_link: Optional[str] = None
    organizer: str
    category: Optional[str] = None
    is_registered: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    events: List[EventResponse]
    total: int
    page: int
    page_size: int


class EventRegistrationResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    registered_at: datetime

    class Config:
        from_attributes = True
