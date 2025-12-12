import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in-progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TicketCategory(str, Enum):
    GENERAL = "general"
    TECHNICAL = "technical"
    ACADEMIC = "academic"
    EVENTS = "events"
    MENTORSHIP = "mentorship"
    OTHER = "other"


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    
    subject = Column(String, nullable=False)
    category = Column(SQLEnum(TicketCategory), default=TicketCategory.GENERAL)
    priority = Column(SQLEnum(TicketPriority), default=TicketPriority.MEDIUM)
    description = Column(Text, nullable=False)
    status = Column(SQLEnum(TicketStatus), default=TicketStatus.OPEN)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User")
    university = relationship("University", back_populates="support_tickets")
    responses = relationship("TicketResponse", back_populates="ticket", cascade="all, delete-orphan")


class TicketResponse(Base):
    __tablename__ = "ticket_responses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String, ForeignKey("support_tickets.id"), nullable=False)
    
    responder_name = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    message = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ticket = relationship("SupportTicket", back_populates="responses")
