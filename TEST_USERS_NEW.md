# Test Users - Updated Setup

## Overview

The database now includes **2 universities**, **2 university admins**, **2 alumni users**, and **1 super admin**.

## Universities

### 1. Tech University
- **Name**: Tech University
- **Code**: TECH
- **Location**: San Francisco, CA
- **Description**: Leading technology and engineering university

### 2. Business University
- **Name**: Business University
- **Code**: BIZ
- **Location**: New York, NY
- **Description**: Premier business and management university

## Users

### 🔴 Super Admin (1 user)

| Username | Email | Password | Role | University |
|----------|-------|----------|------|------------|
| `superadmin` | `superadmin@alumni-portal.com` | `superadmin123` | SUPER_ADMIN | None |

**Permissions:**
- Full system access
- Can manage all universities
- Can manage all users
- Can access all data

---

### 🟡 University Admins (2 users)

#### Admin 1 - Tech University
| Username | Email | Password | Role | University |
|----------|-------|----------|------|------------|
| `tech_admin` | `admin1@tech.edu` | `admin123` | UNIVERSITY_ADMIN | Tech University |

**Permissions:**
- Can manage Tech University template
- Can manage Tech University alumni
- Can create events and jobs for Tech University

#### Admin 2 - Business University
| Username | Email | Password | Role | University |
|----------|-------|----------|------|------------|
| `biz_admin` | `admin2@biz.edu` | `admin123` | UNIVERSITY_ADMIN | Business University |

**Permissions:**
- Can manage Business University template
- Can manage Business University alumni
- Can create events and jobs for Business University

---

### 🟢 Alumni Users (2 users)

#### Alumni 1 - Tech University
| Username | Email | Password | Role | University |
|----------|-------|----------|------|------------|
| `tech_alumni` | `alumni1@tech.edu` | `alumni123` | ALUMNI | Tech University |

**What they get:**
- Receives Tech University's template on login
- Can access Tech University events and jobs
- Can update own profile

#### Alumni 2 - Business University
| Username | Email | Password | Role | University |
|----------|-------|----------|------|------------|
| `biz_alumni` | `alumni2@biz.edu` | `alumni123` | ALUMNI | Business University |

**What they get:**
- Receives Business University's template on login
- Can access Business University events and jobs
- Can update own profile

---

## Testing Scenarios

### Scenario 1: Admin Sets Template for Their University

1. **Login as Tech Admin:**
   ```bash
   POST /api/v1/auth/login
   {
     "username": "tech_admin",
     "password": "admin123",
     "website_template": "modern-blue"
   }
   ```
   → Template saved to **Tech University**

2. **Login as Tech Alumni:**
   ```bash
   POST /api/v1/auth/login
   {
     "username": "tech_alumni",
     "password": "alumni123"
   }
   ```
   → Receives `"website_template": "modern-blue"` (from Tech University)

3. **Login as Business Alumni:**
   ```bash
   POST /api/v1/auth/login
   {
     "username": "biz_alumni",
     "password": "alumni123"
   }
   ```
   → Receives `"website_template": null` (Business University has no template yet)

### Scenario 2: Different Templates for Different Universities

1. **Tech Admin sets template:**
   - Login as `tech_admin` with `"website_template": "tech-theme"`

2. **Business Admin sets template:**
   - Login as `biz_admin` with `"website_template": "business-theme"`

3. **Result:**
   - Tech alumni get `"tech-theme"`
   - Business alumni get `"business-theme"`
   - Each university has its own template!

### Scenario 3: Super Admin Access

1. **Login as Super Admin:**
   ```bash
   POST /api/v1/auth/login
   {
     "username": "superadmin",
     "password": "superadmin123"
   }
   ```
   → Can access all universities and manage everything

---

## Quick Test Commands

### Test Tech University Flow
```bash
# 1. Tech Admin sets template
curl -X POST https://alumni-portal-yw7q.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "tech_admin", "password": "admin123", "website_template": "tech-blue"}'

# 2. Tech Alumni receives template
curl -X POST https://alumni-portal-yw7q.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "tech_alumni", "password": "alumni123"}'
```

### Test Business University Flow
```bash
# 1. Business Admin sets template
curl -X POST https://alumni-portal-yw7q.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "biz_admin", "password": "admin123", "website_template": "biz-green"}'

# 2. Business Alumni receives template
curl -X POST https://alumni-portal-yw7q.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "biz_alumni", "password": "alumni123"}'
```

---

## Summary

✅ **1 Super Admin** - Full system access  
✅ **2 University Admins** - One per university  
✅ **2 Alumni Users** - One per university  
✅ **2 Universities** - Tech University and Business University  

Each university can have its own template, and all alumni of that university will receive the same template!

