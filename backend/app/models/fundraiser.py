import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Fundraiser(Base):
    __tablename__ = "fundraisers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(Text, default=None)
    image = Column(String, default=None)
    
    goal_amount = Column(Integer, default=0)
    current_amount = Column(Integer, default=0)
    donation_link = Column(String, default=None)
    
    start_date = Column(Date, default=None)
    end_date = Column(Date, default=None)
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    university = relationship("University", back_populates="fundraisers")
