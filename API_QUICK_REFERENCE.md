# API Quick Reference Guide

## Base URL
```
Production: https://alumni-portal-yw7q.onrender.com/api/v1
```

## Authentication Header
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Login (username/email + password) |
| POST | `/auth/register` | ❌ | Register new user |
| GET | `/auth/me` | ✅ | Get current user |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout |
| GET | `/auth/template` | ✅ | Get university template |
| PUT | `/auth/template` | ✅ | Update template (admin) |

---

## 📝 Feed (Posts, Comments, Likes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/feed/posts` | ✅ | Create post |
| GET | `/feed/posts` | ⚠️ | List posts (pagination) |
| GET | `/feed/posts/{id}` | ⚠️ | Get post with comments/likes |
| PUT | `/feed/posts/{id}` | ✅ | Update post (author only) |
| DELETE | `/feed/posts/{id}` | ✅ | Delete post (author/admin) |
| POST | `/feed/posts/{id}/comments` | ✅ | Add comment |
| DELETE | `/feed/comments/{id}` | ✅ | Delete comment (author/admin) |
| POST | `/feed/posts/{id}/like` | ✅ | Toggle like |

---

## 👥 Admin Feed Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/feed/admin/posts` | ✅ Admin | List all posts (with search/filters) |
| POST | `/feed/admin/posts/{id}/hide` | ✅ Admin | Hide post |
| POST | `/feed/admin/posts/{id}/restore` | ✅ Admin | Restore post |
| POST | `/feed/admin/posts/{id}/pin` | ✅ Admin | Pin/unpin post |

---

## 👤 Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | ✅ Admin | List users |
| GET | `/users/{id}` | ✅ Admin | Get user by ID |

---

## 🎓 Alumni

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/alumni/me` | ✅ | Get my profile |
| PUT | `/alumni/me` | ✅ | Update my profile |
| GET | `/alumni` | ⚠️ | List alumni profiles |

---

## 📅 Events

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events` | ⚠️ | List events |
| POST | `/events` | ✅ | Create event |
| GET | `/events/{id}` | ⚠️ | Get event |
| POST | `/events/{id}/register` | ✅ | Register for event |

---

## 💼 Jobs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/jobs` | ⚠️ | List job postings |
| POST | `/jobs` | ✅ | Create job posting |
| GET | `/jobs/{id}` | ⚠️ | Get job posting |
| POST | `/jobs/{id}/apply` | ✅ | Apply for job |

---

## 📄 Documents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/documents/upload` | ✅ | Upload document |
| GET | `/documents` | ⚠️ | List documents |
| POST | `/documents/search` | ⚠️ | Search documents (AI) |
| GET | `/documents/{id}` | ⚠️ | Get document |
| PUT | `/documents/{id}` | ✅ | Update document |
| DELETE | `/documents/{id}` | ✅ | Delete document |

---

## 💬 Chat

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chat/message` | ✅ | Send chat message (AI) |
| GET | `/chat/sessions` | ✅ | List chat sessions |
| GET | `/chat/sessions/{id}` | ✅ | Get session with messages |

---

## Legend
- ✅ = Authentication required
- ⚠️ = Optional authentication (better with auth)
- ❌ = No authentication required
- Admin = University Admin or Super Admin only

---

## Common Request/Response Patterns

### Login Request
```json
{
  "username": "superadmin",  // OR "email": "user@example.com"
  "password": "password123"
}
```

### Login Response
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer",
  "website_template": null
}
```

### Pagination Query Params
```
?page=1&page_size=20
```

### Error Response
```json
{
  "detail": "Error message here"
}
```

---

## Test Credentials

**Super Admin:**
- Username: `superadmin` | Email: `superadmin@alumni-portal.com`
- Password: `superadmin123`

**Tech Admin:**
- Username: `tech_admin` | Email: `admin1@tech.edu`
- Password: `admin123`

**Tech Alumni:**
- Username: `tech_alumni` | Email: `alumni1@tech.edu`
- Password: `alumni123`

---

## Interactive Docs
- Swagger UI: https://alumni-portal-yw7q.onrender.com/docs
- ReDoc: https://alumni-portal-yw7q.onrender.com/redoc

