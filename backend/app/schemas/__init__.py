# Import all schemas
from app.schemas.user import (
    UserBase, UserCreate, UserLogin, UserUpdate, UserProfileUpdate,
    UserResponse, UserProfileResponse, UserWithProfileResponse,
    Token, TokenData, PasswordResetRequest, PasswordResetResponse
)
from app.schemas.post import (
    AuthorResponse, CommentCreate, CommentResponse,
    PostCreate, PostUpdate, PostResponse, PostListResponse
)
from app.schemas.event import (
    EventCreate, EventUpdate, EventResponse, EventListResponse,
    EventRegistrationResponse
)
from app.schemas.group import (
    GroupCreate, GroupUpdate, GroupResponse, GroupListResponse,
    GroupMessageCreate, GroupMessageSenderResponse, GroupMessageResponse
)
from app.schemas.connection import (
    ConnectionUserResponse, ConnectionResponse, ConnectionListResponse,
    ConnectionRequestCreate, ConnectionRequestFromUser, ConnectionRequestResponse
)
from app.schemas.message import (
    MessageCreate, MessageResponse,
    ConversationUserResponse, ConversationResponse, ConversationMessagesResponse
)
from app.schemas.document import (
    DocumentRequestCreate, DocumentRequestResponse, DocumentRequestListResponse,
    GeneratedDocumentCreate, GeneratedDocumentResponse
)
from app.schemas.support import (
    TicketResponseCreate, TicketResponseResponse,
    SupportTicketCreate, SupportTicketUpdate, SupportTicketResponse,
    SupportTicketListResponse
)
from app.schemas.notification import (
    NotificationResponse, NotificationListResponse
)
from app.schemas.admin import (
    AdminDashboardStats, AlumniUserCreate, AlumniUserResponse,
    AlumniUserListResponse, BulkImportResponse,
    PasswordResetRequest as AdminPasswordResetReq, PasswordResetListResponse,
    AdminDocumentRequestResponse, AdminDocumentListResponse,
    AdminTicketResponse, AdminTicketListResponse,
    FundraiserCreate, FundraiserUpdate, FundraiserResponse,
    AdCreate, AdUpdate, AdResponse
)
from app.schemas.superadmin import (
    SuperAdminDashboardStats, UniversityCreate, UniversityUpdate, UniversityResponse,
    AdminUserCreate, AdminUserResponse, AdminUserListResponse,
    AdminPasswordResetRequest, AdminPasswordResetListResponse,
    GlobalAdCreate, GlobalAdUpdate, GlobalAdResponse
)

__all__ = [
    # User schemas
    "UserBase", "UserCreate", "UserLogin", "UserUpdate", "UserProfileUpdate",
    "UserResponse", "UserProfileResponse", "UserWithProfileResponse",
    "Token", "TokenData", "PasswordResetRequest", "PasswordResetResponse",
    # Post schemas
    "AuthorResponse", "CommentCreate", "CommentResponse",
    "PostCreate", "PostUpdate", "PostResponse", "PostListResponse",
    # Event schemas
    "EventCreate", "EventUpdate", "EventResponse", "EventListResponse",
    "EventRegistrationResponse",
    # Group schemas
    "GroupCreate", "GroupUpdate", "GroupResponse", "GroupListResponse",
    "GroupMessageCreate", "GroupMessageSenderResponse", "GroupMessageResponse",
    # Connection schemas
    "ConnectionUserResponse", "ConnectionResponse", "ConnectionListResponse",
    "ConnectionRequestCreate", "ConnectionRequestFromUser", "ConnectionRequestResponse",
    # Message schemas
    "MessageCreate", "MessageResponse",
    "ConversationUserResponse", "ConversationResponse", "ConversationMessagesResponse",
    # Document schemas
    "DocumentRequestCreate", "DocumentRequestResponse", "DocumentRequestListResponse",
    "GeneratedDocumentCreate", "GeneratedDocumentResponse",
    # Support schemas
    "TicketResponseCreate", "TicketResponseResponse",
    "SupportTicketCreate", "SupportTicketUpdate", "SupportTicketResponse",
    "SupportTicketListResponse",
    # Notification schemas
    "NotificationResponse", "NotificationListResponse",
    # Admin schemas
    "AdminDashboardStats", "AlumniUserCreate", "AlumniUserResponse",
    "AlumniUserListResponse", "BulkImportResponse",
    "AdminPasswordResetReq", "PasswordResetListResponse",
    "AdminDocumentRequestResponse", "AdminDocumentListResponse",
    "AdminTicketResponse", "AdminTicketListResponse",
    "FundraiserCreate", "FundraiserUpdate", "FundraiserResponse",
    "AdCreate", "AdUpdate", "AdResponse",
    # Superadmin schemas
    "SuperAdminDashboardStats", "UniversityCreate", "UniversityUpdate", "UniversityResponse",
    "AdminUserCreate", "AdminUserResponse", "AdminUserListResponse",
    "AdminPasswordResetRequest", "AdminPasswordResetListResponse",
    "GlobalAdCreate", "GlobalAdUpdate", "GlobalAdResponse",
]
