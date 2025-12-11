# 🧪 API Testing Instructions

**Complete Guide to Testing All APIs in the Alumni Portal**

---

## 📋 Overview

The project includes a comprehensive HTTP-based test script that tests all 31+ API endpoints via actual HTTP requests.

---

## 🚀 Quick Start

### Step 1: Start the Server

Open a terminal and start the FastAPI server:

```bash
python -m uvicorn app.main:app --reload
```

The server will start at: `http://localhost:8000`

### Step 2: Run the Test Script

Open **another terminal** and run:

```bash
python test_all_apis_http.py
```

The script will automatically:
- ✅ Check if the server is running
- ✅ Test all API endpoints
- ✅ Show detailed results
- ✅ Provide error summaries

---

## 📊 What Gets Tested

### 1. **Root Endpoints** (2 endpoints)
- `GET /` - Root endpoint
- `GET /health` - Health check

### 2. **Authentication** (5 endpoints)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### 3. **Users** (3 endpoints)
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update current user
- `GET /api/v1/users` - List users (admin only)

### 4. **Alumni** (4 endpoints)
- `POST /api/v1/alumni` - Create alumni profile
- `GET /api/v1/alumni` - List alumni profiles
- `GET /api/v1/alumni/me` - Get my profile
- `PUT /api/v1/alumni/me` - Update my profile

### 5. **Events** (4 endpoints)
- `POST /api/v1/events` - Create event
- `GET /api/v1/events` - List events
- `GET /api/v1/events/{id}` - Get event by ID
- `POST /api/v1/events/{id}/register` - Register for event

### 6. **Jobs** (4 endpoints)
- `POST /api/v1/jobs` - Create job posting
- `GET /api/v1/jobs` - List active jobs
- `GET /api/v1/jobs/{id}` - Get job by ID
- `POST /api/v1/jobs/{id}/apply` - Apply for job

### 7. **Documents** (6 endpoints)
- `POST /api/v1/documents/upload` - Upload document
- `GET /api/v1/documents` - List documents
- `GET /api/v1/documents/{id}` - Get document
- `PUT /api/v1/documents/{id}` - Update document
- `POST /api/v1/documents/search` - Vector search
- `DELETE /api/v1/documents/{id}` - Delete document

### 8. **Chat** (3 endpoints)
- `POST /api/v1/chat/message` - Send message (RAG)
- `GET /api/v1/chat/sessions` - List chat sessions
- `GET /api/v1/chat/sessions/{id}` - Get session with messages

### 9. **Feed** (7 endpoints)
- `POST /api/v1/feed/posts` - Create post
- `GET /api/v1/feed/posts` - List posts
- `GET /api/v1/feed/posts/{id}` - Get post
- `PUT /api/v1/feed/posts/{id}` - Update post
- `DELETE /api/v1/feed/posts/{id}` - Delete post
- `POST /api/v1/feed/posts/{id}/comments` - Create comment
- `POST /api/v1/feed/posts/{id}/like` - Like post

**Total: 38+ endpoints tested**

---

## 📝 Test Script Features

### ✅ Automatic Authentication
- Creates a test user automatically
- Gets access token for authenticated requests
- Handles token refresh

### ✅ Smart Test Flow
- Tests endpoints in logical order
- Creates resources (events, jobs, documents) before testing them
- Cleans up test data where possible

### ✅ Detailed Reporting
- Shows pass/fail for each endpoint
- Displays HTTP status codes
- Provides error messages
- Summary statistics

### ✅ Error Handling
- Gracefully handles missing dependencies
- Skips tests that require optional services (e.g., AI APIs)
- Continues testing even if some endpoints fail

---

## 🔧 Configuration

### Base URL
Default: `http://localhost:8000`

To change, edit `test_all_apis_http.py`:
```python
BASE_URL = "http://your-server:8000"
```

### Timeout
Default: 30 seconds per request

To change:
```python
self.client = httpx.AsyncClient(base_url=BASE_URL, timeout=60.0)
```

---

## 📊 Expected Results

### ✅ Successful Test Run
```
============================================================
📊 TEST SUMMARY
============================================================
✅ Passed: 35
❌ Failed: 2
⏭️  Skipped: 1
📝 Total: 38
============================================================
```

### Common Issues

#### 1. **Server Not Running**
```
❌ Server is not running!
📋 Please start the server first:
   python -m uvicorn app.main:app --reload
```

**Solution:** Start the server in another terminal.

#### 2. **Database Connection Error**
```
❌ Failed: Database connection error
```

**Solution:** 
- Check PostgreSQL is running
- Verify `.env` has correct `DATABASE_URL`
- Run migrations: `alembic upgrade head`

#### 3. **Authentication Errors**
```
❌ POST /auth/register - Status: 400
```

**Solution:**
- Check if user already exists
- Verify password requirements
- Check email format

#### 4. **AI API Errors** (Expected)
```
⏭️  POST /chat/message - Skipped (requires API keys)
```

**Solution:** 
- This is expected if Groq/Hugging Face keys are not set
- Add API keys to `.env` to test AI features
- See `HOW_TO_GET_FREE_AI_API_KEYS.md`

---

## 🎯 Testing Specific Endpoints

### Test Only Authentication
Edit `test_all_apis_http.py` and comment out other test sections.

### Test Only Documents
Comment out other sections, keep only document tests.

### Test with Different User
Modify `test_auth_register()` to use different credentials.

---

## 🔍 Manual Testing

### Using Swagger UI
1. Start server: `python -m uvicorn app.main:app --reload`
2. Open: http://localhost:8000/docs
3. Click "Authorize" button
4. Enter Bearer token: `your_access_token`
5. Test endpoints interactively

### Using curl
```bash
# Register
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","full_name":"Test User","password":"testpass123"}'

# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Get current user (with token)
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman
1. Import OpenAPI spec from: http://localhost:8000/openapi.json
2. Set up environment variables
3. Create collection with all endpoints
4. Run collection

---

## 📈 Continuous Testing

### Run Tests on CI/CD
```yaml
# Example GitHub Actions
- name: Start server
  run: python -m uvicorn app.main:app &
  
- name: Wait for server
  run: sleep 5
  
- name: Run API tests
  run: python test_all_apis_http.py
```

---

## 🐛 Troubleshooting

### Issue: "All connection attempts failed"
**Cause:** Server not running  
**Solution:** Start server first

### Issue: "401 Unauthorized"
**Cause:** Invalid or expired token  
**Solution:** Re-run test to get new token

### Issue: "500 Internal Server Error"
**Cause:** Server-side error  
**Solution:** Check server logs, verify database connection

### Issue: "422 Validation Error"
**Cause:** Invalid request data  
**Solution:** Check request format matches API schema

---

## 📚 Related Documentation

- **API Documentation:** `FRONTEND_DEVELOPER_API_GUIDE.md`
- **AI Setup:** `HOW_TO_GET_FREE_AI_API_KEYS.md`
- **Database Setup:** See project README

---

## ✅ Checklist

Before running tests:
- [ ] Server is running
- [ ] Database is connected
- [ ] `.env` file is configured
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Migrations applied: `alembic upgrade head`
- [ ] Seed data initialized (optional)

---

**Last Updated:** December 10, 2025

