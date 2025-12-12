import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Ad(Base):
    __tablename__ = "ads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    university_id = Column(String, ForeignKey("universities.id"), nullable=True)  # Null for global ads
    
    image = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default=None)
    link = Column(String, default=None)
    
    type = Column(String, default="general")  # general, compact
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    university = relationship("University", back_populates="ads")
