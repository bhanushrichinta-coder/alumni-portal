"""
University model
"""
from sqlalchemy import Column, String, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class University(BaseModel):
    """University model"""
    __tablename__ = "universities"

    name = Column(String(255), nullable=False, unique=True, index=True)
    code = Column(String(50), nullable=True, unique=True, index=True)  # Short code like "MIT", "STANFORD"
    website_template = Column(String(100), nullable=True)  # Template choice for this university
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    
    # Branding fields
    logo_url = Column(String(512), nullable=True)  # University logo URL
    # Light mode colors
    light_primary_color = Column(String(7), nullable=True)  # Hex color code like #B1810B
    light_secondary_color = Column(String(7), nullable=True)  # Hex color code like #2E2D29
    light_accent_color = Column(String(7), nullable=True)  # Hex color code like #E6A82D
    # Dark mode colors
    dark_primary_color = Column(String(7), nullable=True)  # Hex color code like #FFD700
    dark_secondary_color = Column(String(7), nullable=True)  # Hex color code like #5F574F
    dark_accent_color = Column(String(7), nullable=True)  # Hex color code like #FFA500

    # Relationships
    users = relationship("User", back_populates="university")
    posts = relationship("Post", back_populates="university")
    documents = relationship("Document", back_populates="university")
    document_requests = relationship("DocumentRequest", back_populates="university")

