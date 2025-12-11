# Frontend API Documentation

## Base URL
```
Production: https://alumni-portal-yw7q.onrender.com
Local: http://localhost:8000
```

## Authentication

### JWT Token Usage

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

**Token Structure:**
- Access Token: Valid for 30 minutes (default)
- Refresh Token: Valid for 7 days (default)
- Token Type: `bearer`

**Token Storage:**
- Store tokens in localStorage or secure storage
- Include access token in all API requests
- Use refresh token to get new access token when expired

---

## Module 1: Authentication APIs

### 1.1 Login
**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "username": "superadmin",  // OR "email": "superadmin@alumni-portal.com"
  "password": "superadmin123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "website_template": null  // or "template1" for admins with university
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: User account is inactive
- `422 Validation Error`: Missing required fields

---

### 1.2 Register
**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "password123",
  "full_name": "New User"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 10,
    "email": "newuser@example.com",
    "username": "newuser",
    "full_name": "New User",
    "role": "ALUMNI",
    "is_active": true,
    "is_verified": false,
    "university_id": null,
    "created_at": "2025-12-11T10:00:00",
    "updated_at": "2025-12-11T10:00:00"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### 1.3 Get Current User
**Endpoint:** `GET /api/v1/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "superadmin@alumni-portal.com",
  "username": "superadmin",
  "full_name": "Super Administrator",
  "role": "SUPER_ADMIN",
  "is_active": true,
  "is_verified": true,
  "university_id": null,
  "created_at": "2025-12-11T10:00:00",
  "updated_at": "2025-12-11T10:00:00"
}
```

---

### 1.4 Refresh Token
**Endpoint:** `POST /api/v1/auth/refresh`

**Request:**
```json
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // refresh_token as string
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### 1.5 Logout
**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 1.6 Get University Template (Admin)
**Endpoint:** `GET /api/v1/auth/template`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "website_template": "template1",
  "university_name": "Tech University",
  "university_id": 2,
  "username": "tech_admin",
  "role": "UNIVERSITY_ADMIN"
}
```

---

### 1.7 Update University Template (Admin)
**Endpoint:** `PUT /api/v1/auth/template`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
"template1"  // template name as string
```

**Response (200 OK):**
```json
{
  "message": "University template updated successfully",
  "website_template": "template1",
  "university_name": "Tech University",
  "username": "tech_admin"
}
```

---

## Module 2: Feed APIs (Posts, Comments, Likes)

### 2.1 Create Post
**Endpoint:** `POST /api/v1/feed/posts`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "content": "Excited to share that I just got promoted to Senior Engineer at TechCorp!"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "content": "Excited to share that I just got promoted to Senior Engineer at TechCorp!",
  "author_id": 5,
  "author_name": "Tech Alumni User",
  "university_id": 2,
  "university_name": "Tech University",
  "status": "active",
  "is_pinned": false,
  "likes_count": 0,
  "comments_count": 0,
  "user_liked": false,
  "created_at": "2025-12-11T10:00:00",
  "updated_at": "2025-12-11T10:00:00",
  "comments": [],
  "likes": []
}
```

---

### 2.2 List Posts
**Endpoint:** `GET /api/v1/feed/posts`

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `page_size` (optional, default: 20): Items per page
- `university_id` (optional): Filter by university
- `status_filter` (optional): "active", "deleted", "hidden" (admin only)

**Headers:**
```
Authorization: Bearer <access_token>  // Optional for public posts
```

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": 1,
      "content": "Post content here...",
      "author_id": 5,
      "author_name": "Tech Alumni User",
      "university_id": 2,
      "university_name": "Tech University",
      "status": "active",
      "is_pinned": false,
      "likes_count": 45,
      "comments_count": 8,
      "user_liked": true,
      "created_at": "2025-12-11T10:00:00",
      "updated_at": "2025-12-11T10:00:00",
      "comments": [],
      "likes": []
    }
  ],
  "total": 50,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```

---

### 2.3 Get Single Post
**Endpoint:** `GET /api/v1/feed/posts/{post_id}`

**Headers:**
```
Authorization: Bearer <access_token>  // Optional
```

**Response (200 OK):**
```json
{
  "id": 1,
  "content": "Post content here...",
  "author_id": 5,
  "author_name": "Tech Alumni User",
  "university_id": 2,
  "university_name": "Tech University",
  "status": "active",
  "is_pinned": false,
  "likes_count": 45,
  "comments_count": 8,
  "user_liked": true,
  "created_at": "2025-12-11T10:00:00",
  "updated_at": "2025-12-11T10:00:00",
  "comments": [
    {
      "id": 1,
      "content": "Congratulations!",
      "post_id": 1,
      "author_id": 6,
      "author_name": "Another User",
      "status": "active",
      "created_at": "2025-12-11T10:05:00",
      "updated_at": "2025-12-11T10:05:00"
    }
  ],
  "likes": [
    {
      "id": 1,
      "post_id": 1,
      "user_id": 7,
      "user_name": "Liker User",
      "created_at": "2025-12-11T10:01:00"
    }
  ]
}
```

---

### 2.4 Update Post
**Endpoint:** `PUT /api/v1/feed/posts/{post_id}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "content": "Updated post content"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "content": "Updated post content",
  "author_id": 5,
  "author_name": "Tech Alumni User",
  "university_id": 2,
  "university_name": "Tech University",
  "status": "active",
  "is_pinned": false,
  "likes_count": 45,
  "comments_count": 8,
  "user_liked": true,
  "created_at": "2025-12-11T10:00:00",
  "updated_at": "2025-12-11T10:10:00",
  "comments": [],
  "likes": []
}
```

---

### 2.5 Delete Post
**Endpoint:** `DELETE /api/v1/feed/posts/{post_id}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

---

### 2.6 Add Comment
**Endpoint:** `POST /api/v1/feed/posts/{post_id}/comments`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "content": "Great post! Congratulations!"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "content": "Great post! Congratulations!",
  "post_id": 1,
  "author_id": 6,
  "author_name": "Another User",
  "status": "active",
  "created_at": "2025-12-11T10:05:00",
  "updated_at": "2025-12-11T10:05:00"
}
```

---

### 2.7 Delete Comment
**Endpoint:** `DELETE /api/v1/feed/comments/{comment_id}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

---

### 2.8 Toggle Like
**Endpoint:** `POST /api/v1/feed/posts/{post_id}/like`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "liked": true,
  "message": "Post liked"
}
```

**Or if already liked:**
```json
{
  "liked": false,
  "message": "Post unliked"
}
```

---

## Module 3: Admin Feed Management APIs

### 3.1 List All Posts (Admin)
**Endpoint:** `GET /api/v1/feed/admin/posts`

**Query Parameters:**
- `page` (optional, default: 1)
- `page_size` (optional, default: 20)
- `university_id` (optional)
- `status_filter` (optional): "active", "deleted", "hidden"
- `search` (optional): Search by content or author name

**Headers:**
```
Authorization: Bearer <access_token>  // Admin only
```

**Response (200 OK):**
```json
{
  "posts": [...],
  "total": 50,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```

---

### 3.2 Hide Post (Admin)
**Endpoint:** `POST /api/v1/feed/admin/posts/{post_id}/hide`

**Headers:**
```
Authorization: Bearer <access_token>  // Admin only
```

**Response (200 OK):**
```json
{
  "message": "Post hidden successfully",
  "post_id": 1
}
```

---

### 3.3 Restore Post (Admin)
**Endpoint:** `POST /api/v1/feed/admin/posts/{post_id}/restore`

**Headers:**
```
Authorization: Bearer <access_token>  // Admin only
```

**Response (200 OK):**
```json
{
  "message": "Post restored successfully",
  "post_id": 1
}
```

---

### 3.4 Pin/Unpin Post (Admin)
**Endpoint:** `POST /api/v1/feed/admin/posts/{post_id}/pin`

**Headers:**
```
Authorization: Bearer <access_token>  // Admin only
```

**Response (200 OK):**
```json
{
  "message": "Post pinned",
  "post_id": 1,
  "is_pinned": true
}
```

---

## Module 4: User Management APIs

### 4.1 List Users (Admin)
**Endpoint:** `GET /api/v1/users`

**Query Parameters:**
- `skip` (optional, default: 0): Offset
- `limit` (optional, default: 100): Limit

**Headers:**
```
Authorization: Bearer <access_token>  // Admin only
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "superadmin@alumni-portal.com",
    "username": "superadmin",
    "full_name": "Super Administrator",
    "role": "SUPER_ADMIN",
    "is_active": true,
    "is_verified": true,
    "university_id": null,
    "created_at": "2025-12-11T10:00:00",
    "updated_at": "2025-12-11T10:00:00"
  }
]
```

---

### 4.2 Get User by ID (Admin)
**Endpoint:** `GET /api/v1/users/{user_id}`

**Headers:**
```
Authorization: Bearer <access_token>  // Admin only
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "superadmin@alumni-portal.com",
  "username": "superadmin",
  "full_name": "Super Administrator",
  "role": "SUPER_ADMIN",
  "is_active": true,
  "is_verified": true,
  "university_id": null,
  "created_at": "2025-12-11T10:00:00",
  "updated_at": "2025-12-11T10:00:00"
}
```

---

## Module 5: Alumni Profile APIs

### 5.1 Get My Profile
**Endpoint:** `GET /api/v1/alumni/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 5,
  "graduation_year": 2020,
  "degree": "Computer Science",
  "major": "Software Engineering",
  "current_position": "Senior Engineer",
  "company": "TechCorp",
  "location": "San Francisco, CA",
  "bio": "Passionate software engineer...",
  "linkedin_url": "https://linkedin.com/in/user",
  "github_url": "https://github.com/user",
  "website": "https://user.com",
  "created_at": "2025-12-11T10:00:00",
  "updated_at": "2025-12-11T10:00:00"
}
```

---

### 5.2 Update My Profile
**Endpoint:** `PUT /api/v1/alumni/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "graduation_year": 2020,
  "degree": "Computer Science",
  "major": "Software Engineering",
  "current_position": "Senior Engineer",
  "company": "TechCorp",
  "location": "San Francisco, CA",
  "bio": "Updated bio...",
  "linkedin_url": "https://linkedin.com/in/user",
  "github_url": "https://github.com/user",
  "website": "https://user.com"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 5,
  "graduation_year": 2020,
  "degree": "Computer Science",
  "major": "Software Engineering",
  "current_position": "Senior Engineer",
  "company": "TechCorp",
  "location": "San Francisco, CA",
  "bio": "Updated bio...",
  "linkedin_url": "https://linkedin.com/in/user",
  "github_url": "https://github.com/user",
  "website": "https://user.com",
  "created_at": "2025-12-11T10:00:00",
  "updated_at": "2025-12-11T10:10:00"
}
```

---

### 5.3 List Alumni Profiles
**Endpoint:** `GET /api/v1/alumni`

**Query Parameters:**
- `skip` (optional, default: 0)
- `limit` (optional, default: 100)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 5,
    "graduation_year": 2020,
    "degree": "Computer Science",
    "major": "Software Engineering",
    "current_position": "Senior Engineer",
    "company": "TechCorp",
    "location": "San Francisco, CA",
    "bio": "Passionate software engineer...",
    "linkedin_url": "https://linkedin.com/in/user",
    "github_url": "https://github.com/user",
    "website": "https://user.com",
    "created_at": "2025-12-11T10:00:00",
    "updated_at": "2025-12-11T10:00:00"
  }
]
```

---

## Module 6: Events APIs

### 6.1 List Events
**Endpoint:** `GET /api/v1/events`

**Query Parameters:**
- `skip` (optional, default: 0)
- `limit` (optional, default: 100)
- `status` (optional): "upcoming", "ongoing", "completed", "cancelled"

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Alumni Networking Event",
    "description": "Join us for networking...",
    "event_type": "networking",
    "start_date": "2025-12-20T18:00:00",
    "end_date": "2025-12-20T21:00:00",
    "location": "San Francisco, CA",
    "venue": "Tech Hub",
    "max_attendees": 100,
    "registration_deadline": "2025-12-18T23:59:59",
    "status": "upcoming",
    "is_public": true,
    "creator_id": 2,
    "created_at": "2025-12-11T10:00:00",
    "updated_at": "2025-12-11T10:00:00"
  }
]
```

---

### 6.2 Create Event
**Endpoint:** `POST /api/v1/events`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "title": "Alumni Networking Event",
  "description": "Join us for networking...",
  "event_type": "networking",
  "start_date": "2025-12-20T18:00:00",
  "end_date": "2025-12-20T21:00:00",
  "location": "San Francisco, CA",
  "venue": "Tech Hub",
  "max_attendees": 100,
  "registration_deadline": "2025-12-18T23:59:59",
  "is_public": true
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Alumni Networking Event",
  "description": "Join us for networking...",
  "event_type": "networking",
  "start_date": "2025-12-20T18:00:00",
  "end_date": "2025-12-20T21:00:00",
  "location": "San Francisco, CA",
  "venue": "Tech Hub",
  "max_attendees": 100,
  "registration_deadline": "2025-12-18T23:59:59",
  "status": "upcoming",
  "is_public": true,
  "creator_id": 2,
  "created_at": "2025-12-11T10:00:00",
  "updated_at": "2025-12-11T10:00:00"
}
```

---

### 6.3 Register for Event
**Endpoint:** `POST /api/v1/events/{event_id}/register`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (201 Created):**
```json
{
  "id": 1,
  "event_id": 1,
  "user_id": 5,
  "status": "registered",
  "registered_at": "2025-12-11T10:00:00"
}
```

---

## Module 7: Job Postings APIs

### 7.1 List Job Postings
**Endpoint:** `GET /api/v1/jobs`

**Query Parameters:**
- `skip` (optional, default: 0)
- `limit` (optional, default: 100)
- `status` (optional): "draft", "published", "closed"
- `job_type` (optional): "full_time", "part_time", "contract", "internship"

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Senior Software Engineer",
    "company": "TechCorp",
    "description": "We are looking for...",
    "requirements": "5+ years experience...",
    "location": "San Francisco, CA",
    "job_type": "full_time",
    "status": "published",
    "salary_min": 120000.00,
    "salary_max": 180000.00,
    "currency": "USD",
    "application_deadline": "2025-12-31T23:59:59",
    "is_featured": true,
    "poster_id": 2,
    "created_at": "2025-12-11T10:00:00",
    "updated_at": "2025-12-11T10:00:00"
  }
]
```

---

### 7.2 Create Job Posting
**Endpoint:** `POST /api/v1/jobs`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "title": "Senior Software Engineer",
  "company": "TechCorp",
  "description": "We are looking for...",
  "requirements": "5+ years experience...",
  "location": "San Francisco, CA",
  "job_type": "full_time",
  "salary_min": 120000.00,
  "salary_max": 180000.00,
  "currency": "USD",
  "application_deadline": "2025-12-31T23:59:59",
  "is_featured": true
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Senior Software Engineer",
  "company": "TechCorp",
  "description": "We are looking for...",
  "requirements": "5+ years experience...",
  "location": "San Francisco, CA",
  "job_type": "full_time",
  "status": "published",
  "salary_min": 120000.00,
  "salary_max": 180000.00,
  "currency": "USD",
  "application_deadline": "2025-12-31T23:59:59",
  "is_featured": true,
  "poster_id": 2,
  "created_at": "2025-12-11T10:00:00",
  "updated_at": "2025-12-11T10:00:00"
}
```

---

### 7.3 Apply for Job
**Endpoint:** `POST /api/v1/jobs/{job_id}/apply`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "cover_letter": "I am interested in this position...",
  "resume_url": "https://example.com/resume.pdf"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "job_posting_id": 1,
  "applicant_id": 5,
  "status": "pending",
  "cover_letter": "I am interested in this position...",
  "resume_url": "https://example.com/resume.pdf",
  "applied_at": "2025-12-11T10:00:00"
}
```

---

## Module 8: Documents APIs

### 8.1 Upload Document
**Endpoint:** `POST /api/v1/documents/upload`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request (Form Data):**
- `file`: File (PDF, DOCX, TXT)
- `title` (optional): Document title
- `description` (optional): Document description

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Resume.pdf",
  "description": null,
  "file_path": "/uploads/resume_12345.pdf",
  "file_type": "pdf",
  "file_size": 102400,
  "status": "processing",
  "uploader_id": 5,
  "created_at": "2025-12-11T10:00:00",
  "updated_at": "2025-12-11T10:00:00"
}
```

---

### 8.2 List Documents
**Endpoint:** `GET /api/v1/documents`

**Query Parameters:**
- `skip` (optional, default: 0)
- `limit` (optional, default: 100)
- `file_type` (optional): "pdf", "docx", "txt"

**Headers:**
```
Authorization: Bearer <access_token>  // Optional
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Resume.pdf",
    "description": null,
    "file_path": "/uploads/resume_12345.pdf",
    "file_type": "pdf",
    "file_size": 102400,
    "status": "processed",
    "uploader_id": 5,
    "created_at": "2025-12-11T10:00:00",
    "updated_at": "2025-12-11T10:00:00"
  }
]
```

---

### 8.3 Search Documents
**Endpoint:** `POST /api/v1/documents/search`

**Headers:**
```
Authorization: Bearer <access_token>  // Optional
```

**Request:**
```json
{
  "query": "software engineering experience",
  "limit": 10
}
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "document_id": 1,
      "title": "Resume.pdf",
      "chunk_text": "I have 5 years of software engineering experience...",
      "score": 0.95,
      "chunk_index": 2
    }
  ],
  "total": 1
}
```

---

## Module 9: Chat APIs

### 9.1 Send Chat Message
**Endpoint:** `POST /api/v1/chat/message`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "message": "What are the upcoming events?",
  "session_id": null  // null for new session, or existing session_id
}
```

**Response (200 OK):**
```json
{
  "message": "What are the upcoming events?",
  "response": "Here are the upcoming events: ...",
  "session_id": 1,
  "tokens_used": 150
}
```

---

### 9.2 List Chat Sessions
**Endpoint:** `GET /api/v1/chat/sessions`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 5,
    "title": "Chat Session 1",
    "created_at": "2025-12-11T10:00:00",
    "updated_at": "2025-12-11T10:00:00"
  }
]
```

---

### 9.3 Get Chat Session with Messages
**Endpoint:** `GET /api/v1/chat/sessions/{session_id}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 5,
  "title": "Chat Session 1",
  "created_at": "2025-12-11T10:00:00",
  "updated_at": "2025-12-11T10:00:00",
  "messages": [
    {
      "id": 1,
      "session_id": 1,
      "role": "user",
      "content": "What are the upcoming events?",
      "tokens_used": 10,
      "created_at": "2025-12-11T10:00:00"
    },
    {
      "id": 2,
      "session_id": 1,
      "role": "assistant",
      "content": "Here are the upcoming events: ...",
      "tokens_used": 150,
      "created_at": "2025-12-11T10:00:05"
    }
  ]
}
```

---

## Error Responses

### Common Error Codes

**400 Bad Request:**
```json
{
  "detail": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Not authenticated"  // Missing or invalid token
}
```

**403 Forbidden:**
```json
{
  "detail": "Not enough permissions"  // User doesn't have required role
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found"
}
```

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error"
}
```

---

## User Roles

- **SUPER_ADMIN**: Full system access, can manage all users and universities
- **UNIVERSITY_ADMIN**: Can manage their university's users and content
- **ALUMNI**: Standard user, can create posts, apply for jobs, register for events
- **GUEST**: Limited read-only access

---

## Test Credentials

### Super Admin
- **Username:** `superadmin`
- **Email:** `superadmin@alumni-portal.com`
- **Password:** `superadmin123`

### Tech University Admin
- **Username:** `tech_admin`
- **Email:** `admin1@tech.edu`
- **Password:** `admin123`

### Business University Admin
- **Username:** `biz_admin`
- **Email:** `admin2@biz.edu`
- **Password:** `admin123`

### Tech Alumni
- **Username:** `tech_alumni`
- **Email:** `alumni1@tech.edu`
- **Password:** `alumni123`

### Business Alumni
- **Username:** `biz_alumni`
- **Email:** `alumni2@biz.edu`
- **Password:** `alumni123`

---

## Frontend Implementation Tips

### 1. Token Management
```javascript
// Store tokens
localStorage.setItem('access_token', response.access_token);
localStorage.setItem('refresh_token', response.refresh_token);

// Include in requests
const token = localStorage.getItem('access_token');
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 2. Token Refresh
```javascript
// When access token expires (401), refresh it
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    body: refreshToken
  });
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
}
```

### 3. Error Handling
```javascript
// Handle 401 - refresh token and retry
if (response.status === 401) {
  await refreshToken();
  // Retry original request
}
```

### 4. Pagination
```javascript
// For paginated endpoints
const page = 1;
const pageSize = 20;
const url = `/api/v1/feed/posts?page=${page}&page_size=${pageSize}`;
```

---

## API Documentation URL

Interactive API documentation (Swagger UI):
```
https://alumni-portal-yw7q.onrender.com/docs
```

Alternative documentation (ReDoc):
```
https://alumni-portal-yw7q.onrender.com/redoc
```

