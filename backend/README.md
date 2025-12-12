# Alumni Connect Hub - Backend API

A comprehensive FastAPI backend for the Alumni Connect Hub platform.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Alumni, Admin, Super Admin)
- **User Management**: Registration, profiles, mentorship
- **Social Features**: Posts, comments, likes, connections
- **Groups & Events**: Community groups with chat, event management and registration
- **Messaging**: Personal and group messaging
- **Document Management**: Official document requests and AI-generated documents (resume, cover letters)
- **Support System**: Ticket-based support with admin responses
- **Notifications**: Real-time notifications for various activities
- **Admin Dashboard**: University-specific administration
- **Super Admin**: Platform-wide management, university management

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (python-jose) with bcrypt password hashing
- **Validation**: Pydantic v2

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/          # API route handlers
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── posts.py
│   │       ├── events.py
│   │       ├── groups.py
│   │       ├── connections.py
│   │       ├── messages.py
│   │       ├── documents.py
│   │       ├── support.py
│   │       ├── notifications.py
│   │       ├── admin.py
│   │       └── superadmin.py
│   ├── core/
│   │   ├── config.py        # Settings & configuration
│   │   ├── database.py      # Database connection
│   │   └── security.py      # Authentication utilities
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py
│   │   ├── university.py
│   │   ├── post.py
│   │   ├── event.py
│   │   ├── group.py
│   │   ├── connection.py
│   │   ├── message.py
│   │   ├── document.py
│   │   ├── support.py
│   │   ├── notification.py
│   │   ├── mentor.py
│   │   ├── fundraiser.py
│   │   └── ad.py
│   ├── schemas/             # Pydantic schemas
│   │   └── ...
│   └── main.py              # FastAPI application
├── postman/                 # Postman collection
├── seed_data.py             # Database seeding script
├── requirements.txt
└── README.md
```

## Setup

### Prerequisites

- Python 3.9+
- PostgreSQL 13+

### Installation

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create a PostgreSQL database:**
   ```sql
   CREATE DATABASE alumni_connect_hub;
   ```

5. **Configure environment variables:**
   
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/alumni_connect_hub
   SECRET_KEY=your-super-secret-key-change-this-in-production
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

6. **Run the seed script (optional, for demo data):**
   ```bash
   python seed_data.py
   ```

7. **Start the server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Authentication

The API uses JWT Bearer token authentication. To access protected endpoints:

1. Register or login to get an access token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your_access_token>
   ```

## Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@alumni.connect | password123 |
| MIT Admin | admin@mit.edu | password123 |
| Stanford Admin | admin@stanford.edu | password123 |
| MIT Alumni | john.doe@alumni.mit.edu | password123 |
| Stanford Alumni | alice.johnson@alumni.stanford.edu | password123 |

## API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/request-password-reset` - Request password reset

### Users
- `GET /api/v1/users` - Search users
- `GET /api/v1/users/{id}` - Get user by ID
- `PUT /api/v1/users/me` - Update current user
- `PUT /api/v1/users/me/profile` - Update profile

### Posts
- `GET /api/v1/posts` - List posts
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts/{id}` - Get post
- `PUT /api/v1/posts/{id}` - Update post
- `DELETE /api/v1/posts/{id}` - Delete post
- `POST /api/v1/posts/{id}/like` - Like post
- `DELETE /api/v1/posts/{id}/like` - Unlike post
- `GET /api/v1/posts/{id}/comments` - Get comments
- `POST /api/v1/posts/{id}/comments` - Add comment

### Events
- `GET /api/v1/events` - List events
- `POST /api/v1/events` - Create event
- `GET /api/v1/events/{id}` - Get event
- `PUT /api/v1/events/{id}` - Update event
- `DELETE /api/v1/events/{id}` - Delete event
- `POST /api/v1/events/{id}/register` - Register for event
- `DELETE /api/v1/events/{id}/register` - Unregister

### Groups
- `GET /api/v1/groups` - List groups
- `POST /api/v1/groups` - Create group
- `POST /api/v1/groups/{id}/join` - Join group
- `DELETE /api/v1/groups/{id}/leave` - Leave group
- `GET /api/v1/groups/{id}/messages` - Get group messages
- `POST /api/v1/groups/{id}/messages` - Send group message

### Connections
- `GET /api/v1/connections` - List connections
- `POST /api/v1/connections/request` - Send connection request
- `GET /api/v1/connections/requests/received` - Get received requests
- `POST /api/v1/connections/requests/{id}/accept` - Accept request
- `POST /api/v1/connections/requests/{id}/reject` - Reject request

### Messages
- `GET /api/v1/messages/conversations` - List conversations
- `GET /api/v1/messages/conversations/{user_id}` - Get/create conversation
- `POST /api/v1/messages/conversations/{id}` - Send message

### Documents
- `GET /api/v1/documents/requests` - List document requests
- `POST /api/v1/documents/requests` - Create request
- `GET /api/v1/documents/generated` - List AI-generated documents
- `POST /api/v1/documents/generated` - Generate document

### Support
- `GET /api/v1/support/tickets` - List tickets
- `POST /api/v1/support/tickets` - Create ticket
- `POST /api/v1/support/tickets/{id}/respond` - Respond to ticket

### Notifications
- `GET /api/v1/notifications` - List notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PUT /api/v1/notifications/{id}/read` - Mark as read
- `PUT /api/v1/notifications/mark-all-read` - Mark all as read

### Admin (University Admin)
- `GET /api/v1/admin/dashboard` - Dashboard stats
- `GET /api/v1/admin/users` - List alumni
- `POST /api/v1/admin/users` - Create alumni
- `GET /api/v1/admin/documents` - List document requests
- `GET /api/v1/admin/tickets` - List support tickets
- `GET /api/v1/admin/fundraisers` - Manage fundraisers
- `GET /api/v1/admin/ads` - Manage ads

### Super Admin
- `GET /api/v1/superadmin/dashboard` - Platform stats
- `GET /api/v1/superadmin/universities` - Manage universities
- `GET /api/v1/superadmin/admins` - Manage admin users
- `GET /api/v1/superadmin/ads` - Manage global ads

## Postman Collection

Import the Postman collection from `postman/Alumni_Connect_Hub_API.postman_collection.json` for easy API testing.

The collection includes:
- Pre-configured environment variables
- Automatic token storage after login
- All API endpoints organized by module

## Frontend Integration

This backend is designed to work seamlessly with the Alumni Connect Hub frontend. The API responses match the data structures expected by the frontend components.

To integrate:
1. Start the backend server
2. Update the frontend's API base URL to point to `http://localhost:8000/api/v1`
3. Replace localStorage-based data management with API calls

## License

MIT

