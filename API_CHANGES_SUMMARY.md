# API Changes Summary

## Overview
This document summarizes all API changes related to the restricted access flow implementation.

---

## ❌ Removed Endpoints

### 1. Public User Registration
- **Endpoint:** `POST /api/v1/auth/register`
- **Status:** ❌ **REMOVED**
- **Reason:** Public registration disabled - only admins can create users
- **Alternative:** Use `POST /api/v1/users` (admin-only) to create users

---

## ✅ New Endpoints

### 1. Create User (Admin Only)
- **Endpoint:** `POST /api/v1/users`
- **Method:** POST
- **Access:** University Admin or Super Admin
- **Purpose:** Create new users and grant them access

**Request:**
```json
{
  "email": "alumni@example.com",
  "username": "alumni_user",
  "password": "secure_password",
  "full_name": "Alumni Name"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "alumni@example.com",
  "username": "alumni_user",
  "full_name": "Alumni Name",
  "is_active": true,
  "is_verified": true,  // Access granted automatically
  "role": "ALUMNI",
  "university_id": 1,
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00"
}
```

**Behavior:**
- **University Admin:** Can only create alumni users for their own university
- **Super Admin:** Can create users for any university
- New users are automatically set to `is_verified=true` (access granted)

---

## 🔄 Modified Endpoints

### 1. Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Changes:**
  - ✅ Added `is_verified` check for alumni users
  - ✅ Added `is_first_login` flag in response
  - ✅ Returns 403 error if alumni tries to login without access

**New Response Fields:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "website_template": "template1",
  "is_first_login": true  // NEW: Indicates first-time login
}
```

**New Error Response (403):**
```json
{
  "detail": "Access not granted. Please contact your university admin to get access."
}
```
*This error occurs when an alumni user tries to login with `is_verified=false`*

---

### 2. List Users
- **Endpoint:** `GET /api/v1/users`
- **Changes:**
  - ✅ University admins now see only users from their university
  - ✅ Super admins see all users (unchanged)

**Before:** All admins saw all users

**After:**
- **University Admin:** Only sees users where `university_id` matches their university
- **Super Admin:** Sees all users (no filtering)

**Example:**
```bash
# University Admin from Tech University (ID: 1)
GET /api/v1/users
# Returns: Only users with university_id = 1

# Super Admin
GET /api/v1/users
# Returns: All users from all universities
```

---

### 3. Get User by ID
- **Endpoint:** `GET /api/v1/users/{user_id}`
- **Changes:**
  - ✅ Added university scope check for university admins
  - ✅ University admins can only view users from their university

**New Error Response (403):**
```json
{
  "detail": "You can only view users from your university"
}
```
*This error occurs when a university admin tries to view a user from a different university*

**Before:** University admins could view any user

**After:**
- **University Admin:** Can only view users from their university
- **Super Admin:** Can view any user (unchanged)

---

## 📋 Complete API Reference

### Authentication Endpoints

| Endpoint | Method | Access | Status | Changes |
|----------|--------|--------|--------|---------|
| `/api/v1/auth/login` | POST | Public | ✅ Modified | Added `is_first_login`, added `is_verified` check |
| `/api/v1/auth/register` | POST | Public | ❌ **REMOVED** | Public registration disabled |
| `/api/v1/auth/refresh` | POST | Public | ✅ Unchanged | No changes |
| `/api/v1/auth/logout` | POST | Authenticated | ✅ Unchanged | No changes |
| `/api/v1/auth/me` | GET | Authenticated | ✅ Unchanged | No changes |
| `/api/v1/auth/template` | GET | Authenticated | ✅ Unchanged | No changes |
| `/api/v1/auth/template` | PUT | Admin | ✅ Unchanged | No changes |

### User Management Endpoints

| Endpoint | Method | Access | Status | Changes |
|----------|--------|--------|--------|---------|
| `/api/v1/users` | GET | Admin | ✅ Modified | University-scoped filtering |
| `/api/v1/users` | POST | Admin | ✅ **NEW** | Create users (grant access) |
| `/api/v1/users/{user_id}` | GET | Admin | ✅ Modified | University scope check |
| `/api/v1/users/me` | GET | Authenticated | ✅ Unchanged | No changes |
| `/api/v1/users/me` | PUT | Authenticated | ✅ Unchanged | No changes |

---

## 🔐 Access Control Changes

### Alumni Login Restrictions

**Before:**
- Any user with valid credentials could login
- No access verification required

**After:**
- Alumni users **must** have `is_verified=true` to login
- If `is_verified=false`, login returns 403 error
- Super Admin and University Admin can always login (no `is_verified` check)

### User Creation

**Before:**
- Anyone could register via `POST /api/v1/auth/register`
- Users were created with `is_verified=false` by default

**After:**
- Only admins can create users via `POST /api/v1/users`
- New users are automatically set to `is_verified=true` (access granted)
- University admins can only create users for their university

### User Viewing

**Before:**
- University admins could view all users

**After:**
- University admins can only view users from their university
- Super admins can view all users

---

## 📝 Response Schema Changes

### Token Response (Login)
**Added Field:**
```json
{
  "is_first_login": boolean  // NEW: true if last_login was null
}
```

### User Response (Create User)
**New Endpoint:** Returns user with:
- `is_verified: true` (automatically set)
- `university_id` (set based on admin's university)
- `role: "ALUMNI"` (default for university admins)

---

## ⚠️ Breaking Changes

### 1. Public Registration Removed
- **Impact:** Frontend registration forms will fail
- **Action Required:** Remove or disable registration UI, use admin user creation instead

### 2. Alumni Login Restriction
- **Impact:** Existing alumni users with `is_verified=false` cannot login
- **Action Required:** 
  - Update existing alumni users: `UPDATE users SET is_verified=true WHERE role='ALUMNI'`
  - Or recreate them via admin endpoint

### 3. University-Scoped User Listing
- **Impact:** University admins see fewer users
- **Action Required:** Frontend should handle filtered results correctly

---

## 🧪 Testing Checklist

- [ ] Test alumni login with `is_verified=true` (should succeed)
- [ ] Test alumni login with `is_verified=false` (should return 403)
- [ ] Test admin user creation (should set `is_verified=true`)
- [ ] Test university admin user listing (should see only their university)
- [ ] Test super admin user listing (should see all users)
- [ ] Test university admin viewing user from different university (should return 403)
- [ ] Test `is_first_login` flag (should be `true` on first login, `false` on subsequent)

---

## 📚 Related Documentation

- `RESTRICTED_ACCESS_FLOW.md` - Complete flow documentation
- `FIRST_TIME_LOGIN_GUIDE.md` - First-time login handling

---

## Summary

✅ **1 endpoint removed** (public registration)  
✅ **1 endpoint added** (admin user creation)  
✅ **3 endpoints modified** (login, list users, get user)  
✅ **Access control enhanced** (university scoping, alumni verification)

