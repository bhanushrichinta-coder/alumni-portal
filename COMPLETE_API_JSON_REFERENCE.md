# 📚 Complete API JSON Request/Response Reference

**Complete JSON examples for all API endpoints including AI Chat**

**Base URL:** `http://localhost:8000/api/v1`  
**Authentication:** Bearer Token (JWT) in `Authorization` header

---

## 📋 Table of Contents

1. [Authentication APIs](#1-authentication-apis)
2. [User APIs](#2-user-apis)
3. [Alumni Profile APIs](#3-alumni-profile-apis)
4. [Event APIs](#4-event-apis)
5. [Job APIs](#5-job-apis)
6. [Document APIs](#6-document-apis)
7. [AI Chat APIs](#7-ai-chat-apis)
8. [Feed APIs](#8-feed-apis)
9. [Root & Health](#9-root--health)

---

## 1. Authentication APIs

### 1.1 Register User

**Endpoint:** `POST /api/v1/auth/register`  
**Auth:** ❌ Not required

**Request:**
```json
{
  "email": "john.doe@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "is_active": true,
    "is_verified": false,
    "role": "ALUMNI",
    "university_id": null,
    "created_at": "2025-12-11T12:00:00",
    "updated_at": "2025-12-11T12:00:00"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### 1.2 Login

**Endpoint:** `POST /api/v1/auth/login`  
**Auth:** ❌ Not required

**Request:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**OR:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "website_template": null
}
```

---

### 1.3 Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`  
**Auth:** ❌ Not required (but needs refresh_token in body)

**Request:**
```json
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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

### 1.4 Get Current User

**Endpoint:** `GET /api/v1/auth/me`  
**Auth:** ✅ Required

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "is_active": true,
  "is_verified": false,
  "role": "ALUMNI",
  "university_id": 1,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00"
}
```

---

### 1.5 Logout

**Endpoint:** `POST /api/v1/auth/logout`  
**Auth:** ✅ Required

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. User APIs

### 2.1 Get My Profile

**Endpoint:** `GET /api/v1/users/me`  
**Auth:** ✅ Required

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "is_active": true,
  "is_verified": false,
  "role": "ALUMNI",
  "university_id": 1,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00"
}
```

---

### 2.2 Update My Profile

**Endpoint:** `PUT /api/v1/users/me`  
**Auth:** ✅ Required

**Request:**
```json
{
  "full_name": "John Michael Doe",
  "email": "john.m.doe@example.com"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "john.m.doe@example.com",
  "username": "johndoe",
  "full_name": "John Michael Doe",
  "is_active": true,
  "is_verified": false,
  "role": "ALUMNI",
  "university_id": 1,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:05:00"
}
```

---

### 2.3 List Users (Admin Only)

**Endpoint:** `GET /api/v1/users?skip=0&limit=100`  
**Auth:** ✅ Required (Admin only)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "john.doe@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "is_active": true,
    "is_verified": false,
    "role": "ALUMNI",
    "university_id": 1,
    "created_at": "2025-12-11T12:00:00",
    "updated_at": "2025-12-11T12:00:00"
  },
  {
    "id": 2,
    "email": "jane.smith@example.com",
    "username": "janesmith",
    "full_name": "Jane Smith",
    "is_active": true,
    "is_verified": true,
    "role": "ALUMNI",
    "university_id": 1,
    "created_at": "2025-12-10T10:00:00",
    "updated_at": "2025-12-10T10:00:00"
  }
]
```

---

### 2.4 Get User by ID (Admin Only)

**Endpoint:** `GET /api/v1/users/{user_id}`  
**Auth:** ✅ Required (Admin only)

**Response (200 OK):**
```json
{
  "id": 2,
  "email": "jane.smith@example.com",
  "username": "janesmith",
  "full_name": "Jane Smith",
  "is_active": true,
  "is_verified": true,
  "role": "ALUMNI",
  "university_id": 1,
  "created_at": "2025-12-10T10:00:00",
  "updated_at": "2025-12-10T10:00:00"
}
```

---

## 3. Alumni Profile APIs

### 3.1 Create Alumni Profile

**Endpoint:** `POST /api/v1/alumni`  
**Auth:** ✅ Required

**Request:**
```json
{
  "graduation_year": 2020,
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "current_position": "Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "bio": "I am a software engineer with 5 years of experience...",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "github_url": "https://github.com/johndoe",
  "website_url": "https://johndoe.dev",
  "profile_picture_url": "https://example.com/photo.jpg",
  "skills": ["Python", "JavaScript", "React", "Node.js"],
  "interests": ["AI", "Web Development", "Open Source"]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user_id": 1,
  "graduation_year": 2020,
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "current_position": "Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "bio": "I am a software engineer with 5 years of experience...",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "github_url": "https://github.com/johndoe",
  "website_url": "https://johndoe.dev",
  "profile_picture_url": "https://example.com/photo.jpg",
  "skills": ["Python", "JavaScript", "React", "Node.js"],
  "interests": ["AI", "Web Development", "Open Source"],
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00"
}
```

---

### 3.2 List Alumni Profiles

**Endpoint:** `GET /api/v1/alumni?skip=0&limit=100`  
**Auth:** ❌ Not required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "graduation_year": 2020,
    "degree": "Bachelor of Science",
    "major": "Computer Science",
    "current_position": "Software Engineer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "bio": "I am a software engineer...",
    "skills": ["Python", "JavaScript"],
    "interests": ["AI", "Web Development"],
    "created_at": "2025-12-11T12:00:00",
    "updated_at": "2025-12-11T12:00:00"
  }
]
```

---

### 3.3 Get My Profile

**Endpoint:** `GET /api/v1/alumni/me`  
**Auth:** ✅ Required

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "graduation_year": 2020,
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "current_position": "Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "bio": "I am a software engineer...",
  "skills": ["Python", "JavaScript"],
  "interests": ["AI", "Web Development"],
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00"
}
```

---

### 3.4 Update My Profile

**Endpoint:** `PUT /api/v1/alumni/me`  
**Auth:** ✅ Required

**Request:**
```json
{
  "current_position": "Senior Software Engineer",
  "company": "Big Tech Inc",
  "bio": "Updated bio with more experience...",
  "skills": ["Python", "JavaScript", "React", "Node.js", "TypeScript"]
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "graduation_year": 2020,
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "current_position": "Senior Software Engineer",
  "company": "Big Tech Inc",
  "location": "San Francisco, CA",
  "bio": "Updated bio with more experience...",
  "skills": ["Python", "JavaScript", "React", "Node.js", "TypeScript"],
  "interests": ["AI", "Web Development"],
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:10:00"
}
```

---

### 3.5 Get Profile by ID

**Endpoint:** `GET /api/v1/alumni/{profile_id}`  
**Auth:** ❌ Not required

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "graduation_year": 2020,
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "current_position": "Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "bio": "I am a software engineer...",
  "skills": ["Python", "JavaScript"],
  "interests": ["AI", "Web Development"],
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00"
}
```

---

## 4. Event APIs

### 4.1 Create Event

**Endpoint:** `POST /api/v1/events`  
**Auth:** ✅ Required

**Request:**
```json
{
  "title": "Alumni Networking Event 2025",
  "description": "Join us for our annual alumni networking event...",
  "event_type": "networking",
  "start_date": "2025-06-15T18:00:00",
  "end_date": "2025-06-15T22:00:00",
  "location": "Main Campus Auditorium",
  "venue": "University Main Hall",
  "max_attendees": 200,
  "registration_deadline": "2025-06-10T23:59:59",
  "image_url": "https://example.com/event-image.jpg",
  "registration_url": "https://example.com/register",
  "is_online": false,
  "online_link": null
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Alumni Networking Event 2025",
  "description": "Join us for our annual alumni networking event...",
  "event_type": "networking",
  "status": "published",
  "start_date": "2025-06-15T18:00:00",
  "end_date": "2025-06-15T22:00:00",
  "location": "Main Campus Auditorium",
  "venue": "University Main Hall",
  "max_attendees": 200,
  "registration_deadline": "2025-06-10T23:59:59",
  "image_url": "https://example.com/event-image.jpg",
  "registration_url": "https://example.com/register",
  "is_online": false,
  "online_link": null,
  "creator_id": 1,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00"
}
```

**Event Types:** `networking`, `workshop`, `conference`, `social`, `webinar`, `other`

---

### 4.2 List Events

**Endpoint:** `GET /api/v1/events?skip=0&limit=100`  
**Auth:** ❌ Not required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Alumni Networking Event 2025",
    "description": "Join us for our annual alumni networking event...",
    "event_type": "networking",
    "status": "published",
    "start_date": "2025-06-15T18:00:00",
    "end_date": "2025-06-15T22:00:00",
    "location": "Main Campus Auditorium",
    "max_attendees": 200,
    "creator_id": 1,
    "created_at": "2025-12-11T12:00:00",
    "updated_at": "2025-12-11T12:00:00"
  }
]
```

---

### 4.3 Get Event by ID

**Endpoint:** `GET /api/v1/events/{event_id}`  
**Auth:** ❌ Not required

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Alumni Networking Event 2025",
  "description": "Join us for our annual alumni networking event...",
  "event_type": "networking",
  "status": "published",
  "start_date": "2025-06-15T18:00:00",
  "end_date": "2025-06-15T22:00:00",
  "location": "Main Campus Auditorium",
  "max_attendees": 200,
  "creator_id": 1,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00"
}
```

---

### 4.4 Register for Event

**Endpoint:** `POST /api/v1/events/{event_id}/register`  
**Auth:** ✅ Required

**Request:**
```json
{
  "event_id": 1,
  "notes": "Looking forward to attending this event!"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "event_id": 1,
  "user_id": 1,
  "registration_date": "2025-12-11T12:00:00",
  "status": "registered",
  "notes": "Looking forward to attending this event!",
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00"
}
```

---

## 5. Job APIs

### 5.1 Create Job Posting

**Endpoint:** `POST /api/v1/jobs`  
**Auth:** ✅ Required

**Request:**
```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Innovations Inc",
  "description": "We are looking for an experienced software engineer...",
  "requirements": "5+ years of experience, Python, React, PostgreSQL",
  "location": "Remote",
  "job_type": "full_time",
  "salary_min": 120000,
  "salary_max": 180000,
  "currency": "USD",
  "application_deadline": "2025-12-31T23:59:59",
  "application_url": "https://techinnovations.com/careers/apply",
  "contact_email": "careers@techinnovations.com",
  "is_featured": true
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Senior Software Engineer",
  "company": "Tech Innovations Inc",
  "description": "We are looking for an experienced software engineer...",
  "requirements": "5+ years of experience, Python, React, PostgreSQL",
  "location": "Remote",
  "job_type": "full_time",
  "status": "active",
  "salary_min": 120000,
  "salary_max": 180000,
  "currency": "USD",
  "application_deadline": "2025-12-31T23:59:59",
  "application_url": "https://techinnovations.com/careers/apply",
  "contact_email": "careers@techinnovations.com",
  "is_featured": true,
  "poster_id": 1,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00"
}
```

**Job Types:** `full_time`, `part_time`, `contract`, `internship`, `freelance`

---

### 5.2 List Active Jobs

**Endpoint:** `GET /api/v1/jobs?skip=0&limit=100`  
**Auth:** ❌ Not required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Senior Software Engineer",
    "company": "Tech Innovations Inc",
    "description": "We are looking for...",
    "location": "Remote",
    "job_type": "full_time",
    "status": "active",
    "salary_min": 120000,
    "salary_max": 180000,
    "poster_id": 1,
    "created_at": "2025-12-11T12:00:00",
    "updated_at": "2025-12-11T12:00:00"
  }
]
```

---

### 5.3 Get Job by ID

**Endpoint:** `GET /api/v1/jobs/{job_id}`  
**Auth:** ❌ Not required

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Senior Software Engineer",
  "company": "Tech Innovations Inc",
  "description": "We are looking for an experienced software engineer...",
  "location": "Remote",
  "job_type": "full_time",
  "status": "active",
  "salary_min": 120000,
  "salary_max": 180000,
  "poster_id": 1,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00"
}
```

---

### 5.4 Apply for Job

**Endpoint:** `POST /api/v1/jobs/{job_id}/apply`  
**Auth:** ✅ Required

**Request:**
```json
{
  "job_posting_id": 1,
  "cover_letter": "I am very interested in this position...",
  "resume_url": "https://example.com/resume.pdf"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "job_posting_id": 1,
  "applicant_id": 1,
  "cover_letter": "I am very interested in this position...",
  "resume_url": "https://example.com/resume.pdf",
  "status": "pending",
  "applied_date": "2025-12-11T12:00:00",
  "notes": null,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00"
}
```

**Application Status:** `pending`, `reviewing`, `shortlisted`, `rejected`, `accepted`

---

## 6. Document APIs

### 6.1 Upload Document

**Endpoint:** `POST /api/v1/documents/upload`  
**Auth:** ✅ Required  
**Content-Type:** `multipart/form-data`

**Request (Form Data):**
```
file: [binary file data]
title: "University Handbook 2025"
description: "Complete guide for students and alumni"
is_public: false
```

**Response (201 Created):**
```json
{
  "document": {
    "id": 1,
    "title": "University Handbook 2025",
    "description": "Complete guide for students and alumni",
    "file_name": "handbook_2025.pdf",
    "file_size": 2048576,
    "file_type": "pdf",
    "mime_type": "application/pdf",
    "status": "uploaded",
    "is_public": false,
    "uploader_id": 1,
    "chroma_id": null,
    "metadata": null,
    "created_at": "2025-12-11T12:00:00",
    "updated_at": "2025-12-11T12:00:00"
  },
  "message": "Document uploaded successfully"
}
```

**Note:** Document will be processed asynchronously. Status will change to `processed` when embeddings are generated.

---

### 6.2 Search Documents (Vector Search)

**Endpoint:** `POST /api/v1/documents/search`  
**Auth:** ✅ Required (optional, but recommended)

**Request:**
```json
{
  "query": "What are the graduation requirements?",
  "limit": 10,
  "filter_metadata": {
    "university_id": "1"
  }
}
```

**Response (200 OK):**
```json
[
  {
    "document_id": 1,
    "document_title": "University Handbook 2025",
    "chunk_text": "To graduate, students must complete 120 credit hours...",
    "chunk_index": 5,
    "similarity_score": 0.89,
    "metadata": {
      "document_id": "1",
      "chunk_index": 5,
      "title": "University Handbook 2025",
      "file_type": "pdf",
      "university_id": "1"
    }
  },
  {
    "document_id": 1,
    "document_title": "University Handbook 2025",
    "chunk_text": "Graduation requirements include maintaining a 2.5 GPA...",
    "chunk_index": 12,
    "similarity_score": 0.85,
    "metadata": {
      "document_id": "1",
      "chunk_index": 12,
      "title": "University Handbook 2025",
      "file_type": "pdf",
      "university_id": "1"
    }
  }
]
```

---

### 6.3 List Documents

**Endpoint:** `GET /api/v1/documents?skip=0&limit=100`  
**Auth:** ✅ Required (optional)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "University Handbook 2025",
    "description": "Complete guide for students and alumni",
    "file_name": "handbook_2025.pdf",
    "file_size": 2048576,
    "file_type": "pdf",
    "mime_type": "application/pdf",
    "status": "processed",
    "is_public": false,
    "uploader_id": 1,
    "chroma_id": "doc_12345",
    "metadata": null,
    "created_at": "2025-12-11T12:00:00",
    "updated_at": "2025-12-11T12:05:00"
  }
]
```

---

### 6.4 Get Document by ID

**Endpoint:** `GET /api/v1/documents/{document_id}`  
**Auth:** ✅ Required (optional, for private documents)

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "University Handbook 2025",
  "description": "Complete guide for students and alumni",
  "file_name": "handbook_2025.pdf",
  "file_size": 2048576,
  "file_type": "pdf",
  "mime_type": "application/pdf",
  "status": "processed",
  "is_public": false,
  "uploader_id": 1,
  "chroma_id": "doc_12345",
  "metadata": null,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:05:00"
}
```

---

### 6.5 Update Document

**Endpoint:** `PUT /api/v1/documents/{document_id}`  
**Auth:** ✅ Required (owner or admin)

**Request:**
```json
{
  "title": "Updated Handbook Title",
  "description": "Updated description",
  "is_public": true
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Updated Handbook Title",
  "description": "Updated description",
  "file_name": "handbook_2025.pdf",
  "file_size": 2048576,
  "file_type": "pdf",
  "mime_type": "application/pdf",
  "status": "processed",
  "is_public": true,
  "uploader_id": 1,
  "chroma_id": "doc_12345",
  "metadata": null,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:10:00"
}
```

---

### 6.6 Delete Document

**Endpoint:** `DELETE /api/v1/documents/{document_id}`  
**Auth:** ✅ Required (owner or admin)

**Response (204 No Content):**
```
(No response body)
```

---

## 7. AI Chat APIs

### 7.1 Send Message (AI Chat with RAG)

**Endpoint:** `POST /api/v1/chat/message`  
**Auth:** ✅ Required

**Request:**
```json
{
  "content": "What are the graduation requirements?",
  "session_id": null
}
```

**OR (Continue existing session):**
```json
{
  "content": "Tell me more about the GPA requirement",
  "session_id": 1
}
```

**Response (200 OK):**
```json
{
  "message": {
    "id": 5,
    "session_id": 1,
    "role": "assistant",
    "content": "Based on the university handbook, students must complete 120 credit hours and maintain a minimum GPA of 2.5 to graduate. Additionally, students must complete all required courses in their major and fulfill general education requirements.",
    "metadata": "{\"sources\": [{\"document_id\": \"1\", \"chunk_index\": 5, \"title\": \"University Handbook 2025\"}]}",
    "tokens_used": 45,
    "created_at": "2025-12-11T12:00:00"
  },
  "session": {
    "id": 1,
    "user_id": 1,
    "title": "Chat 2025-12-11 12:00",
    "is_active": true,
    "last_message_at": "2025-12-11T12:00:00",
    "created_at": "2025-12-11T11:55:00",
    "updated_at": "2025-12-11T12:00:00"
  },
  "sources": [
    {
      "document_id": "1",
      "chunk_index": 5,
      "title": "University Handbook 2025"
    },
    {
      "document_id": "1",
      "chunk_index": 12,
      "title": "University Handbook 2025"
    }
  ]
}
```

**Note:** 
- If `session_id` is `null`, a new chat session is created
- AI searches uploaded documents for relevant context
- Response includes document sources used for the answer
- Documents are filtered by user's university

---

### 7.2 List Chat Sessions

**Endpoint:** `GET /api/v1/chat/sessions?skip=0&limit=50`  
**Auth:** ✅ Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Chat 2025-12-11 12:00",
    "is_active": true,
    "last_message_at": "2025-12-11T12:00:00",
    "created_at": "2025-12-11T11:55:00",
    "updated_at": "2025-12-11T12:00:00"
  },
  {
    "id": 2,
    "user_id": 1,
    "title": "Chat 2025-12-10 15:30",
    "is_active": true,
    "last_message_at": "2025-12-10T15:45:00",
    "created_at": "2025-12-10T15:30:00",
    "updated_at": "2025-12-10T15:45:00"
  }
]
```

---

### 7.3 Get Session with Messages

**Endpoint:** `GET /api/v1/chat/sessions/{session_id}`  
**Auth:** ✅ Required

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Chat 2025-12-11 12:00",
  "is_active": true,
  "last_message_at": "2025-12-11T12:00:00",
  "created_at": "2025-12-11T11:55:00",
  "updated_at": "2025-12-11T12:00:00",
  "messages": [
    {
      "id": 1,
      "session_id": 1,
      "role": "user",
      "content": "What are the graduation requirements?",
      "metadata": null,
      "tokens_used": null,
      "created_at": "2025-12-11T11:55:00"
    },
    {
      "id": 2,
      "session_id": 1,
      "role": "assistant",
      "content": "Based on the university handbook, students must complete 120 credit hours...",
      "metadata": "{\"sources\": [{\"document_id\": \"1\", \"chunk_index\": 5}]}",
      "tokens_used": 45,
      "created_at": "2025-12-11T11:55:05"
    },
    {
      "id": 3,
      "session_id": 1,
      "role": "user",
      "content": "Tell me more about the GPA requirement",
      "metadata": null,
      "tokens_used": null,
      "created_at": "2025-12-11T12:00:00"
    },
    {
      "id": 4,
      "session_id": 1,
      "role": "assistant",
      "content": "The minimum GPA requirement is 2.5...",
      "metadata": "{\"sources\": [{\"document_id\": \"1\", \"chunk_index\": 12}]}",
      "tokens_used": 38,
      "created_at": "2025-12-11T12:00:05"
    }
  ]
}
```

---

## 8. Feed APIs

### 8.1 Create Post

**Endpoint:** `POST /api/v1/feed/posts`  
**Auth:** ✅ Required

**Request:**
```json
{
  "content": "Excited to announce our annual alumni meetup! Join us on June 15th for networking and fun activities."
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "content": "Excited to announce our annual alumni meetup! Join us on June 15th for networking and fun activities.",
  "author_id": 1,
  "author_name": "John Doe",
  "university_id": 1,
  "university_name": "University of Technology",
  "status": "active",
  "is_pinned": false,
  "likes_count": 0,
  "comments_count": 0,
  "user_liked": false,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00",
  "comments": [],
  "likes": []
}
```

---

### 8.2 List Posts

**Endpoint:** `GET /api/v1/feed/posts?page=1&page_size=20&university_id=1`  
**Auth:** ✅ Required (optional)

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": 1,
      "content": "Excited to announce our annual alumni meetup!",
      "author_id": 1,
      "author_name": "John Doe",
      "university_id": 1,
      "university_name": "University of Technology",
      "status": "active",
      "is_pinned": false,
      "likes_count": 5,
      "comments_count": 3,
      "user_liked": true,
      "created_at": "2025-12-11T12:00:00",
      "updated_at": "2025-12-11T12:00:00",
      "comments": [],
      "likes": []
    }
  ],
  "total": 25,
  "page": 1,
  "page_size": 20,
  "total_pages": 2
}
```

---

### 8.3 Get Post by ID

**Endpoint:** `GET /api/v1/feed/posts/{post_id}`  
**Auth:** ✅ Required (optional)

**Response (200 OK):**
```json
{
  "id": 1,
  "content": "Excited to announce our annual alumni meetup!",
  "author_id": 1,
  "author_name": "John Doe",
  "university_id": 1,
  "university_name": "University of Technology",
  "status": "active",
  "is_pinned": false,
  "likes_count": 5,
  "comments_count": 3,
  "user_liked": true,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:00:00",
  "comments": [
    {
      "id": 1,
      "post_id": 1,
      "author_id": 2,
      "author_name": "Jane Smith",
      "content": "Looking forward to it!",
      "status": "active",
      "created_at": "2025-12-11T12:05:00",
      "updated_at": "2025-12-11T12:05:00"
    }
  ],
  "likes": [
    {
      "id": 1,
      "post_id": 1,
      "user_id": 2,
      "user_name": "Jane Smith",
      "created_at": "2025-12-11T12:06:00"
    }
  ]
}
```

---

### 8.4 Update Post

**Endpoint:** `PUT /api/v1/feed/posts/{post_id}`  
**Auth:** ✅ Required (owner only)

**Request:**
```json
{
  "content": "Updated post content with more details..."
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "content": "Updated post content with more details...",
  "author_id": 1,
  "author_name": "John Doe",
  "university_id": 1,
  "status": "active",
  "is_pinned": false,
  "likes_count": 5,
  "comments_count": 3,
  "user_liked": true,
  "created_at": "2025-12-11T12:00:00",
  "updated_at": "2025-12-11T12:10:00",
  "comments": [],
  "likes": []
}
```

---

### 8.5 Delete Post

**Endpoint:** `DELETE /api/v1/feed/posts/{post_id}`  
**Auth:** ✅ Required (owner or admin)

**Response (204 No Content):**
```
(No response body)
```

---

### 8.6 Create Comment

**Endpoint:** `POST /api/v1/feed/posts/{post_id}/comments`  
**Auth:** ✅ Required

**Request:**
```json
{
  "content": "This sounds great! Count me in."
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "post_id": 1,
  "author_id": 2,
  "author_name": "Jane Smith",
  "content": "This sounds great! Count me in.",
  "status": "active",
  "created_at": "2025-12-11T12:05:00",
  "updated_at": "2025-12-11T12:05:00"
}
```

---

### 8.7 Like Post

**Endpoint:** `POST /api/v1/feed/posts/{post_id}/like`  
**Auth:** ✅ Required

**Response (201 Created):**
```json
{
  "id": 1,
  "post_id": 1,
  "user_id": 2,
  "user_name": "Jane Smith",
  "created_at": "2025-12-11T12:06:00"
}
```

**Note:** If already liked, this will unlike the post (toggle behavior).

---

## 9. Root & Health

### 9.1 Root Endpoint

**Endpoint:** `GET /`  
**Auth:** ❌ Not required

**Response (200 OK):**
```json
{
  "message": "Welcome to Alumni Portal API",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health"
}
```

---

### 9.2 Health Check

**Endpoint:** `GET /health`  
**Auth:** ❌ Not required

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "Alumni Portal"
}
```

---

## 🔐 Authentication Header Format

For all authenticated endpoints, include the Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Common Response Formats

### Success Response
- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **204 No Content:** Request successful, no content to return

### Error Responses

**400 Bad Request:**
```json
{
  "detail": "Validation error: email is required"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**
```json
{
  "detail": "Not enough permissions"
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found"
}
```

**422 Unprocessable Entity:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
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

## 🎯 Quick Reference

### Public Endpoints (No Auth)
- `GET /` - Root
- `GET /health` - Health check
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/events` - List events
- `GET /api/v1/events/{id}` - Get event
- `GET /api/v1/jobs` - List jobs
- `GET /api/v1/jobs/{id}` - Get job
- `GET /api/v1/alumni` - List alumni
- `GET /api/v1/alumni/{id}` - Get alumni profile

### Protected Endpoints (Auth Required)
- All other endpoints require Bearer token authentication

---

## 📚 Additional Resources

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

---

**Last Updated:** December 11, 2025

