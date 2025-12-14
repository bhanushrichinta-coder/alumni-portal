# Deployment Setup Guide - Vercel (Frontend) + Render (Backend)

## 🚀 Quick Deployment Steps

### 1. Push to Personal GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Add S3 integration, admin features, and deployment configs"

# Push to personal GitHub
git push personal main
```

### 2. Deploy Backend to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Web Service**
3. **Connect Repository**: `bhanushrichinta-coder/alumni-portal`
4. **Settings**:
   - **Name**: `alumni-portal-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: Leave empty (or set to `backend` if needed)

5. **Environment Variables** (Add these in Render dashboard):
   ```
   DATABASE_URL=your_neon_database_url
   SECRET_KEY=generate_a_secure_key_here
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=ap-south-1
   S3_BUCKET_NAME=ios-developer-tledch
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   AUTO_SEED=true
   ```

6. **After deployment**, copy the Render URL (e.g., `https://alumni-portal-backend.onrender.com`)

### 3. Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Import Project** → Select `bhanushrichinta-coder/alumni-portal`
3. **Framework Preset**: Vite
4. **Root Directory**: Leave as root (or set to `.` if needed)
5. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Environment Variables** (Add in Vercel):
   ```
   VITE_API_BASE_URL=https://your-render-backend-url.onrender.com/api/v1
   ```

7. **Deploy** → Copy the Vercel URL

### 4. Update CORS in Render

After getting Vercel URL, update Render environment variable:
```
CORS_ORIGINS=https://your-actual-vercel-url.vercel.app
```

Then redeploy backend.

## 📋 Pre-Deployment Checklist

### Backend (Render)
- [ ] Database URL configured (Neon PostgreSQL)
- [ ] SECRET_KEY set (generate secure key)
- [ ] AWS S3 credentials added
- [ ] CORS_ORIGINS set to Vercel URL
- [ ] AUTO_SEED=true (to seed database on first deploy)

### Frontend (Vercel)
- [ ] VITE_API_BASE_URL set to Render backend URL
- [ ] Build succeeds locally (`npm run build`)
- [ ] All environment variables configured

## 🔧 Fixing Signin Issues

### Common Issues:

1. **CORS Errors**
   - Make sure `CORS_ORIGINS` in Render includes your Vercel URL
   - Check backend logs for CORS errors

2. **API Connection**
   - Verify `VITE_API_BASE_URL` in Vercel matches Render URL
   - Check browser console for API errors
   - Ensure backend is running and accessible

3. **Authentication Errors**
   - Check if database is seeded
   - Verify SECRET_KEY is set correctly
   - Check backend logs for authentication errors

## 🧪 Testing After Deployment

1. **Test Login**:
   - Email: `john.doe@alumni.mit.edu`
   - Password: `password123`

2. **Test Features**:
   - Create post with image
   - Admin delete post
   - Document requests
   - Lead intelligence (super admin)

## 📝 Environment Variables Reference

### Render (Backend)
```env
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=ap-south-1
S3_BUCKET_NAME=ios-developer-tledch
CORS_ORIGINS=https://your-app.vercel.app
AUTO_SEED=true
```

### Vercel (Frontend)
```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

## 🐛 Troubleshooting

### Backend Not Starting
- Check Render logs
- Verify all environment variables are set
- Check database connection

### Frontend Can't Connect
- Verify VITE_API_BASE_URL is correct
- Check CORS settings in backend
- Verify backend is running

### Signin Not Working
- Check browser console for errors
- Verify API endpoint is correct
- Check backend logs for authentication errors
- Ensure database is seeded

## 🔄 Update Process

After making changes:
1. Commit and push to personal GitHub
2. Render will auto-deploy backend
3. Vercel will auto-deploy frontend
4. Test on deployed URLs

