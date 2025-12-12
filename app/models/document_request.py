"""
Document request models for university document requests
"""
from sqlalchemy import Column, String, Text, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.base import BaseModel


class DocumentRequestType(str, enum.Enum):
    """Types of documents that can be requested"""
    TRANSCRIPT = "transcript"
    CERTIFICATE = "certificate"
    LETTER = "letter"
    DEGREE = "degree"
    OTHER = "other"


class DocumentRequestStatus(str, enum.Enum):
    """Status of document request"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DocumentRequest(BaseModel):
    """Document request model"""
    __tablename__ = "document_requests"

    document_type = Column(SQLEnum(DocumentRequestType), nullable=False, index=True)
    reason = Column(Text, nullable=False)  # Reason for request
    status = Column(SQLEnum(DocumentRequestStatus), default=DocumentRequestStatus.PENDING, nullable=False, index=True)
    requestor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    university_id = Column(Integer, ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True)
    admin_notes = Column(Text, nullable=True)  # Admin can add notes when approving/rejecting
    processed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)  # Admin who processed it
    processed_at = Column(String(255), nullable=True)  # When it was processed

    # Relationships
    requestor = relationship("User", foreign_keys=[requestor_id], backref="document_requests")
    university = relationship("University", back_populates="document_requests")
    processed_by = relationship("User", foreign_keys=[processed_by_id])

