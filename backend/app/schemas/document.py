from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DocumentRequestCreate(BaseModel):
    document_type: str
    reason: Optional[str] = None


class DocumentRequestResponse(BaseModel):
    id: str
    document_type: str
    reason: Optional[str] = None
    status: str
    requested_at: datetime
    estimated_completion: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentRequestListResponse(BaseModel):
    requests: List[DocumentRequestResponse]
    total: int
    page: int
    page_size: int


class GeneratedDocumentCreate(BaseModel):
    document_type: str
    target_role: Optional[str] = None
    company: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[List[str]] = None
    additional_info: Optional[str] = None


class GeneratedDocumentResponse(BaseModel):
    id: str
    document_type: str
    title: str
    content: Optional[str] = None
    generated_at: datetime

    class Config:
        from_attributes = True
