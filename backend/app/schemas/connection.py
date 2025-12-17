from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ConnectionUserResponse(BaseModel):
    id: str
    name: str
    avatar: str
    university: Optional[str] = None
    year: Optional[str] = None
    major: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None


class ConnectionResponse(BaseModel):
    id: str
    user: ConnectionUserResponse
    connected_date: str


class ConnectionListResponse(BaseModel):
    connections: List[ConnectionResponse]
    total: int


class ConnectionRequestCreate(BaseModel):
    to_user_id: str


class ConnectionRequestFromUser(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = None
    university: Optional[str] = None
    year: Optional[str] = None


class ConnectionRequestResponse(BaseModel):
    id: str
    from_user: ConnectionRequestFromUser
    to_user_id: str
    status: str
    date: str
