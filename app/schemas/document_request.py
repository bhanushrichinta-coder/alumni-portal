"""
Document request schemas
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.document_request import DocumentRequestType, DocumentRequestStatus


class DocumentRequestBase(BaseModel):
    """Base document request schema"""
    document_type: DocumentRequestType
    reason: str = Field(..., min_length=10, max_length=1000, description="Reason for requesting the document")


class DocumentRequestCreate(DocumentRequestBase):
    """Schema for creating a document request"""
    pass


class DocumentRequestUpdate(BaseModel):
    """Schema for updating document request status (admin only)"""
    status: DocumentRequestStatus
    admin_notes: Optional[str] = Field(None, max_length=500, description="Admin notes when approving/rejecting")


class DocumentRequestResponse(DocumentRequestBase):
    """Schema for document request response"""
    id: int
    status: DocumentRequestStatus
    requestor_id: int
    university_id: int
    requestor_name: Optional[str] = None
    university_name: Optional[str] = None
    admin_notes: Optional[str] = None
    processed_by_id: Optional[int] = None
    processed_by_name: Optional[str] = None
    processed_at: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)


class DocumentRequestListResponse(BaseModel):
    """Schema for list of document requests"""
    requests: list[DocumentRequestResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

