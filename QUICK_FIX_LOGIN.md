# Quick Fix for Login Issue

## Problem
User `john.doe@alumni.mit.edu` is deactivated (is_active = False) from earlier testing.

## Solution

### Option 1: Wait for Render Deployment (Recommended)
The activate endpoint has been added and pushed. After Render redeploys (2-3 minutes), you can:

1. Login as admin: `admin@mit.edu` / `password123`
2. Go to User Management
3. Find john.doe user
4. Click "Activate" button (when frontend is updated)

### Option 2: Direct Database Update (Immediate Fix)

If you have access to Render shell or database:

```sql
UPDATE users 
SET is_active = true 
WHERE email = 'john.doe@alumni.mit.edu';
```

### Option 3: Use Reactivate Script (If you have local access)

```bash
cd backend
python reactivate_user.py john.doe@alumni.mit.edu
```

## Test Credentials

- **Alumni**: `john.doe@alumni.mit.edu` / `password123` (currently deactivated)
- **Admin**: `admin@mit.edu` / `password123` ✅ (works)
- **Super Admin**: `superadmin@alumni.connect` / `password123`

## Status

- ✅ Activate endpoint added to code
- ✅ Code pushed to repository
- ⏳ Waiting for Render deployment
- ⏳ User needs to be reactivated

After Render redeploys, the activate endpoint will be available at:
`PUT /api/v1/admin/users/{user_id}/activate`

