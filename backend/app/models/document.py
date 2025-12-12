import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class DocumentRequest(Base):
    __tablename__ = "document_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    
    document_type = Column(String, nullable=False)
    reason = Column(Text, default=None)
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.PENDING)
    estimated_completion = Column(DateTime, default=None)
    
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User")
    university = relationship("University", back_populates="document_requests")


class GeneratedDocument(Base):
    __tablename__ = "generated_documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    document_type = Column(String, nullable=False)  # Resume, Cover Letter
    title = Column(String, nullable=False)
    content = Column(Text, default=None)
    
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")
