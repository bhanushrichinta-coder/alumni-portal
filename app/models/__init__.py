"""SQLAlchemy database models"""

from app.models.user import User
from app.models.university import University
from app.models.alumni import AlumniProfile
from app.models.event import Event, EventRegistration
from app.models.job import JobPosting, JobApplication
from app.models.document import Document, DocumentEmbedding
from app.models.chat import ChatMessage, ChatSession
from app.models.feed import Post, Comment, Like
from app.models.document_request import DocumentRequest
from app.models.post_media import PostMedia

__all__ = [
    "User",
    "University",
    "AlumniProfile",
    "Event",
    "EventRegistration",
    "JobPosting",
    "JobApplication",
    "Document",
    "DocumentEmbedding",
    "ChatMessage",
    "ChatSession",
    "Post",
    "Comment",
    "Like",
    "DocumentRequest",
    "PostMedia",
]


