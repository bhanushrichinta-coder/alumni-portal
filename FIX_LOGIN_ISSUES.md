# 🔧 Fix Login Issues - Complete Guide

## Issues Found & Fixed

### 1. ✅ Password Hashing Bug
- **Issue**: Password hashing function had a bug
- **Fixed**: Updated `get_password_hash()` in `backend/app/core/security.py`
- **Status**: Fixed and pushed

### 2. ✅ API Router Syntax Error
- **Issue**: Syntax error in `backend/app/api/__init__.py`
- **Fixed**: Corrected router inclusion
- **Status**: Fixed and pushed

### 3. ⚠️ Password Hash Mismatch
- **Issue**: Existing passwords in database might have wrong hash format
- **Solution**: Re-seed database or run fix script

## 🔍 Debugging Steps

### Step 1: Check if Users Exist
In Neon Console SQL Editor:
```sql
SELECT email, name, role, is_active FROM users LIMIT 5;
```

### Step 2: Test Password Hash
The password hash might be wrong. Options:

**Option A: Re-seed Database (Recommended)**
1. Render Dashboard → Environment
2. Ensure `AUTO_SEED=true`
3. Delete all users first (or drop and recreate tables)
4. Redeploy - database will auto-seed

**Option B: Fix Existing Passwords**
1. Use the fix script: `python backend/fix_passwords.py`
2. This re-hashes all passwords to "password123"

### Step 3: Test Login Endpoint
```bash
curl -X POST https://alumni-portal-yw7q.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@alumni.mit.edu","password":"password123"}'
```

**Expected Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { ... }
}
```

**If Error:**
- Check error message
- Verify user exists in database
- Check password hash format

## 🚀 Quick Fix (Recommended)

### Method 1: Re-seed Database

1. **In Neon Console** → SQL Editor:
   ```sql
   -- Delete all users (will be recreated by seeding)
   DELETE FROM users;
   ```

2. **In Render** → Environment:
   - Set `AUTO_SEED=true`
   - Save (triggers redeploy)

3. **Check Render Logs** for:
   - `Database is empty. Auto-seeding...`
   - `✓ Created 50 users`
   - `✓ Database seeded successfully`

4. **Test Login**:
   - Email: `john.doe@alumni.mit.edu`
   - Password: `password123`

### Method 2: Fix Existing Passwords

If you can't re-seed, fix existing passwords:

1. **In Render** → Shell (if available):
   ```bash
   cd backend
   python fix_passwords.py
   ```

2. **Or manually in Neon Console**:
   ```sql
   -- This requires the hash, so better to re-seed
   ```

## ✅ Verification Checklist

- [ ] Users exist in database (check Neon Console)
- [ ] `AUTO_SEED=true` in Render
- [ ] Backend code is latest (check Render logs for latest commit)
- [ ] Password hashes are correct (test with fix script)
- [ ] Login endpoint responds correctly (test with curl)
- [ ] Frontend `VITE_API_BASE_URL` is set correctly
- [ ] CORS is configured in Render

## 🐛 Common Issues

### Issue: "Incorrect email or password"
**Causes:**
1. Password hash mismatch
2. User doesn't exist
3. User is inactive

**Fix:**
- Re-seed database
- Or run `fix_passwords.py`

### Issue: "Field required: username"
**Cause:** Wrong endpoint or old code version

**Fix:**
- Ensure latest code is deployed
- Check Render logs for deployment status
- Verify endpoint is `/api/v1/auth/login`

### Issue: CORS Error
**Fix:**
- Update `CORS_ORIGINS` in Render with Vercel URL
- Format: `https://your-app.vercel.app`

## 📝 Test Credentials (After Fix)

- **Alumni**: `john.doe@alumni.mit.edu` / `password123`
- **Admin**: `admin@mit.edu` / `password123`
- **Super Admin**: `superadmin@alumni.connect` / `password123`

## 🎯 Next Steps

1. **Re-seed database** (easiest fix)
2. **Trigger redeploy** in Render
3. **Test login** with credentials above
4. **Check browser console** (F12) for errors
5. **Verify API calls** in Network tab

Everything is fixed in code - just need to re-seed database! 🚀

