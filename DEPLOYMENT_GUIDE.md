# 🚀 Complete Deployment Guide

## Backend (Render) - Already Deployed ✅
- URL: https://alumni-portal-yw7q.onrender.com
- Status: Live

## Frontend (Vercel) - Deploy Now

### 1. Import Project
- Go to: https://vercel.com
- Import: `bhanushrichinta-coder/alumni-portal`
- Root Directory: `.` (empty)

### 2. Environment Variable
Add in Vercel Settings → Environment Variables:
```
VITE_API_BASE_URL=https://alumni-portal-yw7q.onrender.com/api/v1
```

### 3. Deploy
- Click "Deploy"
- Wait 2-3 minutes

### 4. Update CORS in Render
After getting Vercel URL, update in Render:
```
CORS_ORIGINS=https://your-vercel-url.vercel.app
```

## Fix "Invalid Credentials"

### Enable Auto-Seed in Render
1. Render Dashboard → Your Service → Environment
2. Add/Update: `AUTO_SEED=true`
3. Save (auto-redeploys and seeds database)

### Test Credentials (After Seeding)
- Email: `john.doe@alumni.mit.edu`
- Password: `password123`

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify `vercel.json` is valid

### Signin Not Working
- Set `AUTO_SEED=true` in Render
- Check Render logs for seeding messages
- Verify `VITE_API_BASE_URL` in Vercel

### CORS Errors
- Update `CORS_ORIGINS` in Render with Vercel URL
- No trailing slash in URL

## That's It! 🎉
