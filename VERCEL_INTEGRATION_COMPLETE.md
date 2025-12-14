# ✅ Vercel Deployment & Integration Guide

## 🎯 Quick Deployment Steps

### Step 1: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New"** → **"Project"**
4. **Import Repository**: 
   - Search for: `bhanushrichinta-coder/alumni-portal`
   - Click **"Import"**

### Step 2: Configure Project

**Framework Preset**: Vite (should auto-detect)

**Project Settings**:
- **Root Directory**: `.` (leave as root)
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `dist` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

### Step 3: Add Environment Variable

**BEFORE clicking Deploy**, click **"Environment Variables"**:

Add this variable:
```
Name: VITE_API_BASE_URL
Value: https://alumni-portal-yw7q.onrender.com/api/v1
```

**Important**: This connects your frontend to the Render backend!

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. **Copy your Vercel URL** (e.g., `https://alumni-portal-xyz.vercel.app`)

### Step 5: Update CORS in Render

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Open your **alumni-portal** service
3. Go to **"Environment"** tab
4. Find `CORS_ORIGINS` variable
5. Update it to:
   ```
   CORS_ORIGINS=https://your-vercel-url.vercel.app
   ```
   (Replace with your actual Vercel URL from Step 4)

6. Click **"Save Changes"** - Render will auto-redeploy

### Step 6: Test Integration

1. Open your **Vercel URL**
2. **Test Login**:
   - Email: `john.doe@alumni.mit.edu`
   - Password: `password123`
3. **Test Features**:
   - ✅ Create post with image
   - ✅ Create post with video
   - ✅ Admin delete post
   - ✅ Document requests
   - ✅ Lead intelligence (super admin)

## 🔧 Integration Checklist

### Backend (Render) ✅
- [x] Service deployed: `https://alumni-portal-yw7q.onrender.com`
- [ ] Environment variables set (DATABASE_URL, AWS keys, etc.)
- [ ] CORS_ORIGINS updated with Vercel URL
- [ ] AUTO_SEED=true (database seeding)

### Frontend (Vercel) ✅
- [x] Code pushed to GitHub
- [ ] Project imported in Vercel
- [ ] VITE_API_BASE_URL environment variable set
- [ ] Build successful
- [ ] Deployment live

### Integration ✅
- [ ] Frontend can connect to backend
- [ ] Login works
- [ ] API calls succeed
- [ ] No CORS errors
- [ ] Media uploads work (S3)

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies in `package.json`
- Try building locally: `npm run build`

### API Connection Errors
**Check**:
1. `VITE_API_BASE_URL` in Vercel matches Render URL exactly
2. Render backend is running (check Render logs)
3. CORS_ORIGINS includes your Vercel URL
4. Browser console (F12) for specific errors

### Signin Not Working
**Check**:
1. Browser console for API errors
2. Render logs for backend errors
3. Network tab (F12) - check if API calls are reaching backend
4. Verify database is seeded (check Render logs for AUTO_SEED)

### CORS Errors
**Fix**:
1. Update `CORS_ORIGINS` in Render to include Vercel URL
2. Format: `https://your-app.vercel.app` (no trailing slash)
3. Save and redeploy Render service

## 📝 Environment Variables Reference

### Vercel (Frontend)
```
VITE_API_BASE_URL=https://alumni-portal-yw7q.onrender.com/api/v1
```

### Render (Backend)
```
DATABASE_URL=your_neon_database_url
SECRET_KEY=your_secret_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
S3_BUCKET_NAME=ios-developer-tledch
CORS_ORIGINS=https://your-vercel-url.vercel.app
AUTO_SEED=true
```

## 🎉 After Successful Deployment

Your app will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://alumni-portal-yw7q.onrender.com`

### Auto-Deployment
- Every push to `main` or `temp_backend` will auto-deploy
- Vercel will rebuild frontend
- Render will redeploy backend

## ✅ Success Indicators

- ✅ Vercel build completes without errors
- ✅ Frontend loads at Vercel URL
- ✅ Login works with test credentials
- ✅ No CORS errors in browser console
- ✅ API calls succeed (check Network tab)
- ✅ Posts can be created with images
- ✅ Admin features work

## 🆘 Need Help?

1. Check `VERCEL_DEPLOY.md` for detailed steps
2. Check `FIX_SIGNIN.md` for signin troubleshooting
3. Check Render/Vercel logs for errors
4. Check browser console (F12) for frontend errors

Everything is ready! Deploy to Vercel now! 🚀

