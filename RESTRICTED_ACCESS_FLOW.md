# Restricted Access Flow - User Onboarding

## Overview

The system now implements a **restricted access flow** where:
1. **Super Admin** logs in first
2. Super Admin handles **university onboarding** (creates universities)
3. **University Admins** are created (by Super Admin)
4. **University Admins** grant access to alumni users
5. **Only alumni with granted access** can login

## Flow Diagram

```
1. Super Admin Login
   ↓
2. Super Admin Creates Universities
   ↓
3. Super Admin Creates University Admins (assigned to universities)
   ↓
4. University Admin Logs In
   ↓
5. University Admin Creates/Invites Alumni Users
   ↓
6. Alumni Users Can Now Login
```

## Key Changes

### 1. Public Registration Disabled

**Before:** Anyone could register via `POST /api/v1/auth/register`

**Now:** Public registration is **disabled**. Only admins can create users.

**Endpoint Removed:**
- `POST /api/v1/auth/register` - No longer available

### 2. Alumni Access Control

**Login Restriction:**
- Alumni users **must** have `is_verified=True` to login
- If `is_verified=False`, login returns: `"Access not granted. Please contact your university admin to get access."`

**How Access is Granted:**
- University admins create alumni users via `POST /api/v1/users`
- New alumni users are automatically set to `is_verified=True` (access granted)
- Super admins can also create alumni users

### 3. Admin User Creation Endpoint

**New Endpoint:** `POST /api/v1/users`

**Access:** University Admin or Super Admin only

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
  "is_verified": true,  // Access granted
  "role": "ALUMNI",
  "university_id": 1,
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00"
}
```

**Behavior:**
- **University Admin:** Can only create alumni users for their own university
- **Super Admin:** Can create users for any university (or no university)

### 4. University-Scoped User Listing

**Endpoint:** `GET /api/v1/users`

**Behavior:**
- **University Admin:** Sees only users from their university
- **Super Admin:** Sees all users

## API Endpoints

### Authentication

#### Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Access:** Public
- **Note:** Alumni must have `is_verified=True` to login

#### Register
- **Endpoint:** `POST /api/v1/auth/register`
- **Status:** ❌ **DISABLED** - Public registration removed

### User Management (Admin Only)

#### Create User (Grant Access)
- **Endpoint:** `POST /api/v1/users`
- **Access:** University Admin or Super Admin
- **Purpose:** Create new alumni users and grant them access

#### List Users
- **Endpoint:** `GET /api/v1/users`
- **Access:** University Admin or Super Admin
- **Scope:** University admins see only their university's users

#### Get User
- **Endpoint:** `GET /api/v1/users/{user_id}`
- **Access:** University Admin or Super Admin
- **Scope:** University admins can only view users from their university

## User Roles and Permissions

### Super Admin
- ✅ Can login
- ✅ Can create universities
- ✅ Can create university admins
- ✅ Can create alumni users (any university)
- ✅ Can view all users
- ✅ Can manage all universities

### University Admin
- ✅ Can login
- ✅ Can create alumni users (their university only)
- ✅ Can view users (their university only)
- ✅ Can manage their university's template
- ✅ Can manage their university's events, jobs, posts

### Alumni
- ✅ Can login **only if** `is_verified=True`
- ❌ Cannot create other users
- ✅ Can update own profile
- ✅ Can access university-specific content

## Example Workflow

### Step 1: Super Admin Creates University

```bash
# Super Admin logs in
POST /api/v1/auth/login
{
  "username": "superadmin",
  "password": "superadmin123"
}

# Create university (if endpoint exists)
POST /api/v1/universities
{
  "name": "Tech University",
  "code": "TECH",
  "location": "San Francisco, CA"
}
```

### Step 2: Super Admin Creates University Admin

```bash
# Create university admin
POST /api/v1/users
Authorization: Bearer <super_admin_token>
{
  "email": "admin@tech.edu",
  "username": "tech_admin",
  "password": "admin123",
  "full_name": "Tech Admin",
  "role": "UNIVERSITY_ADMIN",  // If supported
  "university_id": 1
}
```

### Step 3: University Admin Grants Access to Alumni

```bash
# University Admin logs in
POST /api/v1/auth/login
{
  "username": "tech_admin",
  "password": "admin123"
}

# Create alumni user (grants access)
POST /api/v1/users
Authorization: Bearer <university_admin_token>
{
  "email": "alumni@tech.edu",
  "username": "tech_alumni",
  "password": "alumni123",
  "full_name": "Tech Alumni"
}
# User is automatically:
# - Assigned to university admin's university
# - Set to role: ALUMNI
# - Set to is_verified: true (access granted)
```

### Step 4: Alumni Can Now Login

```bash
# Alumni logs in
POST /api/v1/auth/login
{
  "username": "tech_alumni",
  "password": "alumni123"
}
# ✅ Success - is_verified=true
```

## Error Messages

### Alumni Login Without Access

**Request:**
```json
POST /api/v1/auth/login
{
  "username": "alumni_user",
  "password": "password123"
}
```

**Response (403 Forbidden):**
```json
{
  "detail": "Access not granted. Please contact your university admin to get access."
}
```

### Public Registration Attempt

**Request:**
```json
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "username": "user",
  "password": "password123"
}
```

**Response (404 Not Found):**
- Endpoint no longer exists

## Database Fields

### `is_verified` Field
- **Purpose:** Tracks if alumni has been granted access
- **Values:**
  - `true`: Access granted, can login
  - `false`: Access not granted, cannot login
- **Set by:** Admins when creating users
- **Default:** `false` (if somehow created without admin)

### `university_id` Field
- **Purpose:** Associates users with universities
- **Alumni:** Must have `university_id` (assigned by admin)
- **University Admin:** Must have `university_id` (assigned by super admin)
- **Super Admin:** Can have `university_id = null`

## Security Notes

1. **No Public Registration:** Prevents unauthorized user creation
2. **Access Control:** Alumni cannot login without admin approval
3. **University Scoping:** University admins can only manage their university's users
4. **Role-Based Access:** Each role has specific permissions

## Migration Notes

If you have existing users:
- Existing alumni users should have `is_verified=True` set manually
- Or they can be recreated by admins via `POST /api/v1/users`

## Summary

✅ Public registration **disabled**  
✅ Alumni must have **access granted** (`is_verified=True`) to login  
✅ University admins **grant access** by creating alumni users  
✅ Super admin handles **university onboarding**  
✅ **Restricted access flow** implemented

