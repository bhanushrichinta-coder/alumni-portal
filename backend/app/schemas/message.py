from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: str
    is_own: bool = False


class ConversationUserResponse(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = None


class ConversationResponse(BaseModel):
    id: str
    user: ConversationUserResponse
    last_message: Optional[str] = None
    time: Optional[str] = None
    unread: int = 0
    is_group: bool = False


class ConversationMessagesResponse(BaseModel):
    conversation: ConversationResponse
    messages: List[MessageResponse]
