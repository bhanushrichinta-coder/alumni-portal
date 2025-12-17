from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TicketResponseCreate(BaseModel):
    message: str


class TicketResponseResponse(BaseModel):
    id: str
    message: str
    responder_name: str
    is_admin: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class SupportTicketCreate(BaseModel):
    subject: str
    category: str
    priority: str
    description: str


class SupportTicketUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None


class SupportTicketResponse(BaseModel):
    id: str
    subject: str
    category: str
    priority: str
    description: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    responses: List[TicketResponseResponse] = []

    class Config:
        from_attributes = True


class SupportTicketListResponse(BaseModel):
    tickets: List[SupportTicketResponse]
    total: int
    page: int
    page_size: int
