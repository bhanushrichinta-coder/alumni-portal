# How to Manually Deploy on Render

## If No Deployment Logs Are Showing

Render should auto-deploy when you push to GitHub, but sometimes you need to trigger it manually.

## Steps to Manually Deploy

### Option 1: Manual Deploy from Render Dashboard

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on your backend service** (alumni-portal-backend)
3. **Look for "Manual Deploy" button** (usually at the top right)
4. **Click "Manual Deploy"** → **"Deploy latest commit"**
5. **Wait for deployment** (usually 2-5 minutes)

### Option 2: Check if Service is Connected to GitHub

1. **Go to Render Dashboard** → Your service
2. **Click "Settings" tab**
3. **Check "Build & Deploy" section**
4. **Verify:**
   - ✅ Connected to GitHub repository
   - ✅ Branch: `main` or `temp_backend`
   - ✅ Auto-Deploy: Enabled

### Option 3: Reconnect GitHub (if needed)

1. **Settings** → **Build & Deploy**
2. **Click "Connect GitHub"** or **"Reconnect"**
3. **Select your repository**: `bhanushrichinta-coder/alumni-portal`
4. **Select branch**: `main` or `temp_backend`
5. **Save**

### Option 4: Check Deployment Status

1. **Go to your service page**
2. **Click "Events" or "Deployments" tab**
3. **Look for recent deployments**
4. **Check status:**
   - 🟢 **Live** = Deployed successfully
   - 🟡 **Building** = Currently deploying
   - 🔴 **Failed** = Deployment error

## What to Look For

### In Logs Tab:
- Build logs (installing dependencies)
- Start logs (starting the application)
- Application logs (runtime logs)

### In Events Tab:
- Deployment started
- Build completed
- Service live

## If Still No Logs

1. **Check if service is running:**
   - Go to service page
   - Look for status indicator (green/yellow/red)
   
2. **Check GitHub connection:**
   - Make sure Render is connected to your GitHub
   - Verify the correct repository and branch

3. **Try manual deploy:**
   - Click "Manual Deploy" → "Deploy latest commit"

4. **Check service health:**
   - Visit: https://alumni-portal-yw7q.onrender.com/health
   - Should return: `{"status":"healthy","service":"Alumni Portal"}`

## Quick Test

After deployment, test if the fix worked:

```bash
# Test user creation (should work now)
curl -X POST https://alumni-portal-yw7q.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mit.edu","password":"password123"}'
```

If login works, the service is deployed!

## Troubleshooting

**No "Manual Deploy" button?**
- Service might be in a different state
- Check if service is paused or stopped
- Try restarting the service

**Deployment keeps failing?**
- Check build logs for errors
- Verify all environment variables are set
- Check if requirements.txt is correct

**Service not updating?**
- Make sure you're pushing to the correct branch
- Verify GitHub connection
- Try manual deploy

## Current Status

- ✅ Code pushed to GitHub: `bhanushrichinta-coder/alumni-portal`
- ✅ Branch: `main`
- ⏳ Waiting for Render to deploy
- 🔍 Check Render dashboard for deployment status

