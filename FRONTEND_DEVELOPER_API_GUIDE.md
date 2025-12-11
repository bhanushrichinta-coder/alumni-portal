# 🚀 Frontend Developer API Integration Guide

**Complete API Reference for Frontend Integration**

**Base URL:** `http://localhost:8000/api/v1`  
**API Version:** v1  
**Authentication:** Bearer Token (JWT)

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication & Token Management](#authentication--token-management)
3. [API Client Setup](#api-client-setup)
4. [Complete API Reference](#complete-api-reference)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [TypeScript Types](#typescript-types)
8. [Integration Examples](#integration-examples)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install axios
# or
yarn add axios
```

### 2. Create API Client

```typescript
// src/api/client.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('refresh_token', response.data.refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔐 Authentication & Token Management

### Token Storage

Store tokens in `localStorage`:

```typescript
// Save tokens after login/register
localStorage.setItem('access_token', accessToken);
localStorage.setItem('refresh_token', refreshToken);

// Get tokens
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');

// Remove tokens on logout
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

### Token Lifecycle

1. **Access Token**: Valid for 30 minutes (default)
2. **Refresh Token**: Valid for 7 days (default)
3. **Auto Refresh**: Automatically refreshed on 401 errors
4. **Manual Refresh**: Can be refreshed manually using `/auth/refresh`

### Authentication Flow

```
1. User Login/Register
   ↓
2. Receive access_token + refresh_token
   ↓
3. Store tokens in localStorage
   ↓
4. Include access_token in all API requests
   ↓
5. If 401 error → Auto refresh token
   ↓
6. If refresh fails → Redirect to login
```

---

## 📡 Complete API Reference

### 🔑 Authentication APIs

#### 1. Register User

**Endpoint:** `POST /api/v1/auth/register`

**Auth Required:** ❌ No

**Request:**
```typescript
{
  email: string;           // Required, valid email
  username: string;        // Required, 3-100 chars
  full_name?: string;      // Optional
  password: string;        // Required, min 8 chars
}
```

**Response:** `201 Created`
```typescript
{
  user: {
    id: number;
    email: string;
    username: string;
    full_name: string | null;
    is_active: boolean;
    is_verified: boolean;
    role: "SUPER_ADMIN" | "UNIVERSITY_ADMIN" | "ALUMNI" | "GUEST";
    created_at: string;     // ISO 8601
    updated_at: string;     // ISO 8601
  };
  access_token: string;     // JWT token
  refresh_token: string;    // JWT refresh token
  token_type: "bearer";
}
```

**Example:**
```typescript
const register = async (data: {
  email: string;
  username: string;
  full_name?: string;
  password: string;
}) => {
  const response = await apiClient.post('/auth/register', data);
  
  // Save tokens
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
  
  return response.data;
};
```

---

#### 2. Login

**Endpoint:** `POST /api/v1/auth/login`

**Auth Required:** ❌ No

**Request:**
```typescript
{
  username: string;        // Required
  password: string;        // Required
}
```

**Response:** `200 OK`
```typescript
{
  access_token: string;     // JWT token
  refresh_token: string;    // JWT refresh token
  token_type: "bearer";
}
```

**Example:**
```typescript
const login = async (username: string, password: string) => {
  const response = await apiClient.post('/auth/login', {
    username,
    password,
  });
  
  // Save tokens
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
  
  return response.data;
};
```

---

#### 3. Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Auth Required:** ❌ No

**Request:**
```typescript
{
  refresh_token: string;    // Required
}
```

**Response:** `200 OK`
```typescript
{
  access_token: string;     // New JWT token
  refresh_token: string;    // New JWT refresh token
  token_type: "bearer";
}
```

**Example:**
```typescript
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token');
  
  const response = await apiClient.post('/auth/refresh', {
    refresh_token: refreshToken,
  });
  
  // Update tokens
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
  
  return response.data;
};
```

---

#### 4. Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Auth Required:** ✅ Yes (Bearer Token)

**Request:** None

**Response:** `200 OK`
```typescript
{
  message: "Logged out successfully";
}
```

**Example:**
```typescript
const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Ignore errors
  } finally {
    // Always clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};
```

---

#### 5. Get Current User

**Endpoint:** `GET /api/v1/auth/me`

**Auth Required:** ✅ Yes (Bearer Token)

**Request:** None

**Response:** `200 OK`
```typescript
{
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  role: "SUPER_ADMIN" | "UNIVERSITY_ADMIN" | "ALUMNI" | "GUEST";
  created_at: string;
  updated_at: string;
}
```

**Example:**
```typescript
const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};
```

---

### 👤 User APIs

#### 6. Get My Profile

**Endpoint:** `GET /api/v1/users/me`

**Auth Required:** ✅ Yes

**Response:** `200 OK`
```typescript
{
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}
```

---

#### 7. Update My Profile

**Endpoint:** `PUT /api/v1/users/me`

**Auth Required:** ✅ Yes

**Request:**
```typescript
{
  email?: string;
  username?: string;
  full_name?: string;
  is_active?: boolean;
  role?: string;  // Only admins can change role
}
```

**Response:** `200 OK`
```typescript
User  // Same as GET /users/me
```

**Example:**
```typescript
const updateProfile = async (data: {
  email?: string;
  username?: string;
  full_name?: string;
}) => {
  const response = await apiClient.put('/users/me', data);
  return response.data;
};
```

---

#### 8. List Users (Admin Only)

**Endpoint:** `GET /api/v1/users?skip=0&limit=100`

**Auth Required:** ✅ Yes (University Admin or Super Admin)

**Query Parameters:**
- `skip?: number` (default: 0) - Number of records to skip
- `limit?: number` (default: 100) - Maximum records to return

**Response:** `200 OK`
```typescript
User[]  // Array of User objects
```

---

#### 9. Get User by ID (Admin Only)

**Endpoint:** `GET /api/v1/users/{user_id}`

**Auth Required:** ✅ Yes (University Admin or Super Admin)

**Response:** `200 OK`
```typescript
User
```

---

### 🎓 Alumni APIs

#### 10. Create Alumni Profile

**Endpoint:** `POST /api/v1/alumni`

**Auth Required:** ✅ Yes

**Request:**
```typescript
{
  user_id: number;                    // Required
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_position?: string;
  company?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  profile_picture_url?: string;
  skills?: string[];                  // Array of strings
  interests?: string[];                // Array of strings
}
```

**Response:** `201 Created`
```typescript
{
  id: number;
  user_id: number;
  graduation_year: number | null;
  degree: string | null;
  major: string | null;
  current_position: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  profile_picture_url: string | null;
  skills: string[] | null;
  interests: string[] | null;
  created_at: string;
  updated_at: string;
}
```

**Example:**
```typescript
const createAlumniProfile = async (data: AlumniProfileCreate) => {
  const response = await apiClient.post('/alumni', data);
  return response.data;
};
```

---

#### 11. List Alumni Profiles

**Endpoint:** `GET /api/v1/alumni?skip=0&limit=100`

**Auth Required:** ❌ No (Public)

**Query Parameters:**
- `skip?: number` (default: 0)
- `limit?: number` (default: 100)

**Response:** `200 OK`
```typescript
AlumniProfile[]  // Array of AlumniProfile objects
```

---

#### 12. Get My Alumni Profile

**Endpoint:** `GET /api/v1/alumni/me`

**Auth Required:** ✅ Yes

**Response:** `200 OK`
```typescript
AlumniProfile
```

---

#### 13. Update My Alumni Profile

**Endpoint:** `PUT /api/v1/alumni/me`

**Auth Required:** ✅ Yes

**Request:**
```typescript
{
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_position?: string;
  company?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  profile_picture_url?: string;
  skills?: string[];
  interests?: string[];
}
```

**Response:** `200 OK`
```typescript
AlumniProfile
```

---

#### 14. Get Alumni Profile by ID

**Endpoint:** `GET /api/v1/alumni/{profile_id}`

**Auth Required:** ❌ No (Public)

**Response:** `200 OK`
```typescript
AlumniProfile
```

---

### 📅 Event APIs

#### 15. Create Event

**Endpoint:** `POST /api/v1/events`

**Auth Required:** ✅ Yes

**Request:**
```typescript
{
  title: string;                      // Required, 1-255 chars
  description?: string;
  event_type: "NETWORKING" | "WORKSHOP" | "CONFERENCE" | "SOCIAL" | "OTHER";
  start_date: string;                 // Required, ISO 8601: "2025-12-20T18:00:00"
  end_date?: string;                   // ISO 8601
  location?: string;
  venue?: string;
  max_attendees?: number;              // Must be > 0
  registration_deadline?: string;      // ISO 8601
  image_url?: string;
  registration_url?: string;
  is_online?: boolean;                 // Default: false
  online_link?: string;
}
```

**Response:** `201 Created`
```typescript
{
  id: number;
  title: string;
  description: string | null;
  event_type: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  start_date: string;
  end_date: string | null;
  location: string | null;
  venue: string | null;
  max_attendees: number | null;
  registration_deadline: string | null;
  image_url: string | null;
  registration_url: string | null;
  is_online: boolean;
  online_link: string | null;
  creator_id: number;
  created_at: string;
  updated_at: string;
}
```

**Example:**
```typescript
const createEvent = async (data: EventCreate) => {
  const response = await apiClient.post('/events', {
    ...data,
    start_date: new Date(data.start_date).toISOString(),
    end_date: data.end_date ? new Date(data.end_date).toISOString() : undefined,
  });
  return response.data;
};
```

---

#### 16. List Events

**Endpoint:** `GET /api/v1/events?skip=0&limit=100`

**Auth Required:** ❌ No (Public)

**Query Parameters:**
- `skip?: number` (default: 0)
- `limit?: number` (default: 100)

**Response:** `200 OK`
```typescript
Event[]  // Array of Event objects
```

---

#### 17. Get Event by ID

**Endpoint:** `GET /api/v1/events/{event_id}`

**Auth Required:** ❌ No (Public)

**Response:** `200 OK`
```typescript
Event
```

---

#### 18. Register for Event

**Endpoint:** `POST /api/v1/events/{event_id}/register`

**Auth Required:** ✅ Yes

**Request:**
```typescript
{
  event_id: number;                   // Required (from URL)
  notes?: string;
}
```

**Response:** `201 Created`
```typescript
{
  id: number;
  event_id: number;
  user_id: number;
  registration_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

**Example:**
```typescript
const registerForEvent = async (eventId: number, notes?: string) => {
  const response = await apiClient.post(`/events/${eventId}/register`, {
    event_id: eventId,
    notes,
  });
  return response.data;
};
```

---

### 💼 Job APIs

#### 19. Create Job Posting

**Endpoint:** `POST /api/v1/jobs`

**Auth Required:** ✅ Yes

**Request:**
```typescript
{
  title: string;                      // Required, 1-255 chars
  company: string;                    // Required, 1-255 chars
  description: string;                 // Required, min 1 char
  requirements?: string;
  location?: string;
  job_type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
  salary_min?: number;
  salary_max?: number;
  currency?: string;                  // Default: "USD"
  application_deadline?: string;      // ISO 8601
  application_url?: string;
  contact_email?: string;
  is_featured?: boolean;              // Default: false
}
```

**Response:** `201 Created`
```typescript
{
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string | null;
  location: string | null;
  job_type: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED" | "EXPIRED";
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  application_deadline: string | null;
  application_url: string | null;
  contact_email: string | null;
  is_featured: boolean;
  poster_id: number;
  created_at: string;
  updated_at: string;
}
```

---

#### 20. List Jobs

**Endpoint:** `GET /api/v1/jobs?skip=0&limit=100`

**Auth Required:** ❌ No (Public)

**Query Parameters:**
- `skip?: number` (default: 0)
- `limit?: number` (default: 100)

**Response:** `200 OK`
```typescript
JobPosting[]  // Array of JobPosting objects (only ACTIVE jobs)
```

---

#### 21. Get Job by ID

**Endpoint:** `GET /api/v1/jobs/{job_id}`

**Auth Required:** ❌ No (Public)

**Response:** `200 OK`
```typescript
JobPosting
```

---

#### 22. Apply for Job

**Endpoint:** `POST /api/v1/jobs/{job_id}/apply`

**Auth Required:** ✅ Yes

**Request:**
```typescript
{
  job_posting_id: number;             // Required (from URL)
  cover_letter?: string;
  resume_url?: string;
}
```

**Response:** `201 Created`
```typescript
{
  id: number;
  job_posting_id: number;
  applicant_id: number;
  cover_letter: string | null;
  resume_url: string | null;
  status: "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED";
  applied_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

---

### 📄 Document APIs

#### 23. Upload Document

**Endpoint:** `POST /api/v1/documents/upload`

**Auth Required:** ✅ Yes

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File (required) - The document file
- `title`: string (required) - Document title
- `description?: string` - Document description
- `is_public?: boolean` - Default: false

**Response:** `201 Created`
```typescript
{
  document: {
    id: number;
    title: string;
    description: string | null;
    file_name: string;
    file_size: number;
    file_type: string;
    mime_type: string;
    status: string;
    is_public: boolean;
    uploader_id: number;
    created_at: string;
    updated_at: string;
  };
  message: string;
}
```

**Example:**
```typescript
const uploadDocument = async (
  file: File,
  title: string,
  description?: string,
  isPublic: boolean = false
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  if (description) formData.append('description', description);
  formData.append('is_public', String(isPublic));
  
  const response = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
```

---

#### 24. Search Documents

**Endpoint:** `POST /api/v1/documents/search`

**Auth Required:** ⚠️ Optional (for private documents)

**Request:**
```typescript
{
  query: string;                      // Required, min 1 char
  limit?: number;                      // Default: 10, min: 1, max: 50
}
```

**Response:** `200 OK`
```typescript
Array<{
  document_id: number;
  document_title: string;
  chunk_text: string;
  chunk_index: number;
  similarity_score: number;
  metadata?: Record<string, any>;
}>
```

---

#### 25. List Documents

**Endpoint:** `GET /api/v1/documents?skip=0&limit=100`

**Auth Required:** ⚠️ Optional (shows public + user's private documents)

**Query Parameters:**
- `skip?: number` (default: 0)
- `limit?: number` (default: 100)

**Response:** `200 OK`
```typescript
Document[]  // Array of Document objects
```

---

#### 26. Get Document by ID

**Endpoint:** `GET /api/v1/documents/{document_id}`

**Auth Required:** ⚠️ Optional (required for private documents)

**Response:** `200 OK`
```typescript
Document
```

---

#### 27. Update Document

**Endpoint:** `PUT /api/v1/documents/{document_id}`

**Auth Required:** ✅ Yes

**Request:**
```typescript
{
  title?: string;
  description?: string;
  is_public?: boolean;
}
```

**Response:** `200 OK`
```typescript
Document
```

---

#### 28. Delete Document

**Endpoint:** `DELETE /api/v1/documents/{document_id}`

**Auth Required:** ✅ Yes

**Response:** `204 No Content` (no body)

---

### 💬 Chat APIs

#### 29. Send Message

**Endpoint:** `POST /api/v1/chat/message`

**Auth Required:** ✅ Yes

**Request:**
```typescript
{
  content: string;                    // Required, min 1 char
  session_id?: number | null;         // If null, creates new session
}
```

**Response:** `200 OK`
```typescript
{
  message: {
    id: number;
    session_id: number;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  };
  session: {
    id: number;
    user_id: number;
    title: string | null;
    is_active: boolean;
    last_message_at: string | null;
    created_at: string;
    updated_at: string;
  };
  sources?: Array<{
    document_id: number;
    title: string;
    snippet: string;
  }>;
}
```

**Example:**
```typescript
const sendChatMessage = async (content: string, sessionId?: number) => {
  const response = await apiClient.post('/chat/message', {
    content,
    session_id: sessionId || null,
  });
  return response.data;
};
```

---

#### 30. List Chat Sessions

**Endpoint:** `GET /api/v1/chat/sessions?skip=0&limit=50`

**Auth Required:** ✅ Yes

**Query Parameters:**
- `skip?: number` (default: 0)
- `limit?: number` (default: 50)

**Response:** `200 OK`
```typescript
Array<{
  id: number;
  user_id: number;
  title: string | null;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}>
```

---

#### 31. Get Chat Session with Messages

**Endpoint:** `GET /api/v1/chat/sessions/{session_id}`

**Auth Required:** ✅ Yes

**Response:** `200 OK`
```typescript
{
  id: number;
  user_id: number;
  title: string | null;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  messages: Array<{
    id: number;
    session_id: number;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  }>;
}
```

---

## ⚠️ Error Handling

### Error Response Format

All errors return JSON:

```typescript
{
  detail: string;  // Error message
}
```

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| `200` | Success | Continue |
| `201` | Created | Resource created |
| `204` | No Content | Success (no body) |
| `400` | Bad Request | Check request data |
| `401` | Unauthorized | Token expired/invalid - refresh token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `422` | Validation Error | Check request validation |
| `500` | Server Error | Contact backend team |

### Error Handling Example

```typescript
try {
  const response = await apiClient.post('/events', eventData);
  return response.data;
} catch (error: any) {
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const message = error.response.data?.detail || 'An error occurred';
    
    switch (status) {
      case 400:
        throw new Error(`Bad Request: ${message}`);
      case 401:
        // Token refresh handled by interceptor
        throw new Error('Unauthorized - Please login again');
      case 403:
        throw new Error(`Forbidden: ${message}`);
      case 404:
        throw new Error(`Not Found: ${message}`);
      case 422:
        throw new Error(`Validation Error: ${message}`);
      default:
        throw new Error(`Server Error: ${message}`);
    }
  } else if (error.request) {
    // Request made but no response
    throw new Error('Network Error - Please check your connection');
  } else {
    throw new Error(`Error: ${error.message}`);
  }
}
```

---

## 📝 TypeScript Types

### Complete Type Definitions

```typescript
// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  role: "SUPER_ADMIN" | "UNIVERSITY_ADMIN" | "ALUMNI" | "GUEST";
  created_at: string;
  updated_at: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  full_name?: string;
  is_active?: boolean;
  role?: string;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  full_name?: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

export interface RegisterResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

// Alumni Types
export interface AlumniProfile {
  id: number;
  user_id: number;
  graduation_year: number | null;
  degree: string | null;
  major: string | null;
  current_position: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  profile_picture_url: string | null;
  skills: string[] | null;
  interests: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface AlumniProfileCreate {
  user_id: number;
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_position?: string;
  company?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  profile_picture_url?: string;
  skills?: string[];
  interests?: string[];
}

export interface AlumniProfileUpdate {
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_position?: string;
  company?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  profile_picture_url?: string;
  skills?: string[];
  interests?: string[];
}

// Event Types
export type EventType = "NETWORKING" | "WORKSHOP" | "CONFERENCE" | "SOCIAL" | "OTHER";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export interface Event {
  id: number;
  title: string;
  description: string | null;
  event_type: EventType;
  status: EventStatus;
  start_date: string;
  end_date: string | null;
  location: string | null;
  venue: string | null;
  max_attendees: number | null;
  registration_deadline: string | null;
  image_url: string | null;
  registration_url: string | null;
  is_online: boolean;
  online_link: string | null;
  creator_id: number;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  location?: string;
  venue?: string;
  max_attendees?: number;
  registration_deadline?: string;
  image_url?: string;
  registration_url?: string;
  is_online?: boolean;
  online_link?: string;
}

export interface EventRegistration {
  id: number;
  event_id: number;
  user_id: number;
  registration_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistrationCreate {
  event_id: number;
  notes?: string;
}

// Job Types
export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
export type JobStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "EXPIRED";
export type ApplicationStatus = "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED";

export interface JobPosting {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string | null;
  location: string | null;
  job_type: JobType;
  status: JobStatus;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  application_deadline: string | null;
  application_url: string | null;
  contact_email: string | null;
  is_featured: boolean;
  poster_id: number;
  created_at: string;
  updated_at: string;
}

export interface JobPostingCreate {
  title: string;
  company: string;
  description: string;
  requirements?: string;
  location?: string;
  job_type: JobType;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  application_deadline?: string;
  application_url?: string;
  contact_email?: string;
  is_featured?: boolean;
}

export interface JobApplication {
  id: number;
  job_posting_id: number;
  applicant_id: number;
  cover_letter: string | null;
  resume_url: string | null;
  status: ApplicationStatus;
  applied_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplicationCreate {
  job_posting_id: number;
  cover_letter?: string;
  resume_url?: string;
}

// Document Types
export interface Document {
  id: number;
  title: string;
  description: string | null;
  file_name: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  status: string;
  is_public: boolean;
  uploader_id: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadResponse {
  document: Document;
  message: string;
}

export interface DocumentSearchQuery {
  query: string;
  limit?: number;
}

export interface DocumentSearchResult {
  document_id: number;
  document_title: string;
  chunk_text: string;
  chunk_index: number;
  similarity_score: number;
  metadata?: Record<string, any>;
}

// Chat Types
export interface ChatSession {
  id: number;
  user_id: number;
  title: string | null;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatMessageCreate {
  content: string;
  session_id?: number | null;
}

export interface ChatResponse {
  message: ChatMessage;
  session: ChatSession;
  sources?: Array<{
    document_id: number;
    title: string;
    snippet: string;
  }>;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}
```

---

## 🔧 Integration Examples

### React Hook Example

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { User, LoginRequest, RegisterRequest } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await apiClient.get('/users/me');
      setUser(response.data);
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', credentials);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      await loadUser();
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', data);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      setUser(response.data.user);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore errors
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  return { user, loading, login, register, logout, loadUser };
}
```

### React Component Example

```typescript
// components/EventList.tsx
import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Event } from '../types';

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/events');
      setEvents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Events</h2>
      {events.map((event) => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p>Date: {new Date(event.start_date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 📌 Important Notes

### 1. Token Management
- **Access Token**: Valid for 30 minutes
- **Refresh Token**: Valid for 7 days
- Always store tokens in `localStorage`
- Token is automatically added to requests via interceptor
- Token is automatically refreshed on 401 errors

### 2. Datetime Format
- Always use **ISO 8601** format: `"2025-12-20T18:00:00"`
- Use `new Date().toISOString()` to convert JavaScript Date to ISO string

### 3. File Uploads
- Use `FormData` for file uploads
- Set `Content-Type: multipart/form-data` header
- Include file and metadata in form data

### 4. Pagination
- Use `skip` and `limit` query parameters
- Default `skip: 0`, `limit: 100`
- Implement infinite scroll or pagination UI

### 5. Error Handling
- Always wrap API calls in try-catch
- Check `error.response.status` for specific error codes
- Display user-friendly error messages
- Handle 401 errors (token refresh is automatic)

### 6. Role-Based Access
- **GUEST**: Can only view public content
- **ALUMNI**: Can create profile, apply for jobs, register for events
- **UNIVERSITY_ADMIN**: Can manage events, jobs, users
- **SUPER_ADMIN**: Full access

---

## 🆘 Support

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Base URL**: http://localhost:8000/api/v1

---

**Last Updated:** December 10, 2025  
**API Version:** v1  
**Status:** ✅ Production Ready

