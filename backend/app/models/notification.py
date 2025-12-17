import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class NotificationType(str, Enum):
    LIKE = "like"
    COMMENT = "comment"
    CONNECTION = "connection"
    EVENT = "event"
    JOB = "job"
    ANNOUNCEMENT = "announcement"
    MESSAGE = "message"
    MENTORSHIP = "mentorship"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    avatar = Column(String, default=None)  # Avatar of triggering user
    
    read = Column(Boolean, default=False)
    action_url = Column(String, default=None)
    related_id = Column(String, default=None)  # ID of related entity
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")
