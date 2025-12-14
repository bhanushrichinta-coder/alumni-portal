# Neon Database Setup & Troubleshooting Guide

## ✅ Neon Database Configuration

### 1. Get Your Neon Connection String

1. Go to **Neon Console**: https://console.neon.tech
2. Select your project
3. Go to **Connection Details**
4. Copy the **Connection String** (it looks like):
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### 2. Set in Render Environment Variables

1. **Render Dashboard** → Your service → **Environment** tab
2. Add/Update:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. **Important**: Use the full connection string from Neon
4. **Save** (auto-redeploys)

## 🔍 Check if Database is Seeded (Neon)

### Method 1: Check Render Logs

1. **Render Dashboard** → Your service → **Logs** tab
2. **Look for these messages**:

**✅ Success Messages:**
- `Database is empty. Auto-seeding...`
- `✓ Created 50 users`
- `✓ Created 3 universities`
- `✓ Created 20 posts`
- `✓ Database seeded successfully`

**OR if already seeded:**
- `Database already has X users. Skipping seed.`

**❌ Error Messages:**
- `⚠ Could not auto-seed database: [error]`
- `Connection refused` or `Connection timeout`
- `SSL connection required`

### Method 2: Check Environment Variables in Render

1. **Render Dashboard** → Your service → **Environment** tab
2. Verify:
   - `DATABASE_URL` is set (your Neon connection string)
   - `AUTO_SEED=true` (to enable automatic seeding)

### Method 3: Test Login Endpoint

Try logging in with test credentials:
- Email: `john.doe@alumni.mit.edu`
- Password: `password123`

**If login works** → Database is seeded ✅
**If "Invalid credentials"** → Database is NOT seeded ❌

### Method 4: Check Neon Console

1. Go to **Neon Console** → Your project
2. Click **SQL Editor**
3. Run:
   ```sql
   SELECT COUNT(*) FROM users;
   ```
4. **If count > 0** → Database has users (seeded) ✅
5. **If count = 0** → Database is empty (not seeded) ❌

## 🔧 Fix Seeding Issues with Neon

### Issue 1: AUTO_SEED Not Running

**Solution:**
1. Render Dashboard → Environment tab
2. Add/Update: `AUTO_SEED=true`
3. Save (triggers redeploy)
4. Check logs after redeploy

### Issue 2: Connection Errors

**Symptoms:**
- `Connection refused`
- `Connection timeout`
- `SSL connection required`

**Solutions:**
1. **Verify DATABASE_URL** in Render:
   - Must include `?sslmode=require` at the end
   - Format: `postgresql://user:pass@host/dbname?sslmode=require`

2. **Check Neon Project Status**:
   - Go to Neon Console
   - Ensure project is **Active** (not paused)
   - Neon free tier pauses after inactivity

3. **Test Connection**:
   ```bash
   # Test from Render logs or locally
   psql "your-neon-connection-string"
   ```

### Issue 3: Schema Mismatch (Events Table)

**Symptoms:**
- `column events.event_type does not exist`
- `column events.start_date does not exist`

**Solution:**
- The code automatically fixes this on startup
- Check Render logs for: `✅ Events table schema fixed!`
- If errors persist, the fix runs automatically on next startup

### Issue 4: Database Paused (Neon Free Tier)

**Symptoms:**
- Connection timeouts
- "Database not available"

**Solution:**
1. Go to **Neon Console**
2. Click **Resume** if database is paused
3. Wait 1-2 minutes for it to wake up
4. Try again

## 🚀 Enable Auto-Seeding

1. **Render Dashboard** → Your service → **Environment** tab
2. Add/Update:
   ```
   AUTO_SEED=true
   DATABASE_URL=your-neon-connection-string
   ```
3. **Save** (auto-redeploys)
4. **Watch Logs** for seeding messages

## 📝 Neon-Specific Notes

### Connection String Format
- Neon provides connection strings in format: `postgresql://...`
- SQLAlchemy works with this format
- Always include `?sslmode=require` for SSL

### Serverless Behavior
- Neon is serverless (may pause after inactivity)
- First connection after pause takes ~2-3 seconds
- Connection pooling is handled automatically

### Connection Pooling
- Code uses `pool_pre_ping=True` (verifies connections)
- `pool_recycle=300` (recycles connections every 5 min)
- This works well with Neon's serverless nature

## ✅ Quick Checklist

- [ ] `DATABASE_URL` set in Render (Neon connection string)
- [ ] Connection string includes `?sslmode=require`
- [ ] `AUTO_SEED=true` in Render
- [ ] Neon project is active (not paused)
- [ ] Check Render logs for seeding messages
- [ ] Test login with `john.doe@alumni.mit.edu` / `password123`

## 🆘 Still Having Issues?

1. **Check Render Logs** for specific error messages
2. **Check Neon Console** → SQL Editor → Run `SELECT COUNT(*) FROM users;`
3. **Verify DATABASE_URL** format in Render
4. **Ensure AUTO_SEED=true** is set
5. **Trigger manual redeploy** in Render

The database connection is now optimized for Neon! 🎉

