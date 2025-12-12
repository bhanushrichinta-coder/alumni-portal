# Test Users for UI Testing

## Overview
Test users created to match the login UI design with MIT and Stanford universities.

---

## 🔴 Super Admin

| Field | Value |
|-------|-------|
| **Email** | `superadmin@alumni-portal.com` |
| **Username** | `superadmin` |
| **Password** | `superadmin123` |
| **Role** | SUPER_ADMIN |
| **University** | None |

**Permissions:**
- Full system access
- Can manage all universities
- Can create university admins
- Can view all users

---

## 🏛️ MIT University

### University Details
- **Name:** MIT
- **Code:** MIT
- **Description:** Massachusetts Institute of Technology
- **Location:** Cambridge, MA

### 🟡 University Admin

| Field | Value |
|-------|-------|
| **Email** | `admin@mit.edu` |
| **Username** | `mit_admin` |
| **Password** | `mit123` |
| **Role** | UNIVERSITY_ADMIN |
| **University** | MIT |

**Permissions:**
- Can manage MIT alumni users
- Can create events and jobs for MIT
- Can manage MIT template
- Can view MIT users only

### 🟢 Alumni User

| Field | Value |
|-------|-------|
| **Email** | `john.doe@mit.edu` |
| **Username** | `john_doe_mit` |
| **Password** | `mit123` |
| **Full Name** | John Doe |
| **Role** | ALUMNI |
| **University** | MIT |

**Note:** Based on UI, this user has:
- Computer Science '20
- Mentor tag

---

## 🏛️ Stanford University

### University Details
- **Name:** Stanford
- **Code:** STANFORD
- **Description:** Stanford University
- **Location:** Stanford, CA

### 🟡 University Admin

| Field | Value |
|-------|-------|
| **Email** | `admin@stanford.edu` |
| **Username** | `stanford_admin` |
| **Password** | `stanford123` |
| **Role** | UNIVERSITY_ADMIN |
| **University** | Stanford |

**Permissions:**
- Can manage Stanford alumni users
- Can create events and jobs for Stanford
- Can manage Stanford template
- Can view Stanford users only

### 🟢 Alumni User

| Field | Value |
|-------|-------|
| **Email** | `michael.smith@stanford.edu` |
| **Username** | `michael_smith_stanford` |
| **Password** | `stanford123` |
| **Full Name** | Michael Smith |
| **Role** | ALUMNI |
| **University** | Stanford |

**Note:** Based on UI, this user has:
- Business Administration '21
- Mentor tag

---

## 🧪 Testing Scenarios

### 1. Super Admin Login
```bash
POST /api/v1/auth/login
{
  "email": "superadmin@alumni-portal.com",
  "password": "superadmin123"
}
```

### 2. MIT Admin Login
```bash
POST /api/v1/auth/login
{
  "email": "admin@mit.edu",
  "password": "mit123"
}
```

### 3. Stanford Admin Login
```bash
POST /api/v1/auth/login
{
  "email": "admin@stanford.edu",
  "password": "stanford123"
}
```

### 4. MIT Alumni Login
```bash
POST /api/v1/auth/login
{
  "email": "john.doe@mit.edu",
  "password": "mit123"
}
```

### 5. Stanford Alumni Login
```bash
POST /api/v1/auth/login
{
  "email": "michael.smith@stanford.edu",
  "password": "stanford123"
}
```

---

## 📋 Quick Reference

| User Type | Email | Password | University |
|-----------|-------|----------|------------|
| Super Admin | `superadmin@alumni-portal.com` | `superadmin123` | None |
| MIT Admin | `admin@mit.edu` | `mit123` | MIT |
| Stanford Admin | `admin@stanford.edu` | `stanford123` | Stanford |
| MIT Alumni | `john.doe@mit.edu` | `mit123` | MIT |
| Stanford Alumni | `michael.smith@stanford.edu` | `stanford123` | Stanford |

---

## 🔄 Database Initialization

To create these users, run:
```bash
python -m app.db.init_db
```

Or the database will be automatically initialized on application startup (if configured).

---

## 📝 Notes

- All users have `is_verified=true` (access granted)
- All users have `is_active=true`
- Alumni users are associated with their respective universities
- University admins can only manage users from their university
- Super admin can manage all users and universities

