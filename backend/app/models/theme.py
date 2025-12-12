from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base


class ThemeMode(str, enum.Enum):
    LIGHT = "light"
    DARK = "dark"


class UserTheme(Base):
    __tablename__ = "user_themes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Theme setting
    theme = Column(SQLEnum(ThemeMode), default=ThemeMode.LIGHT, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="theme")

    def __repr__(self):
        return f"<UserTheme {self.user_id}>"

