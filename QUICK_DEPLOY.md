# 🚀 Quick Deployment Guide

## Step 1: Push to Personal GitHub

```bash
cd /home/bhanushri123/Alumin_Connect_Hub
git add .
git commit -m "Add S3 integration, admin features, and deployment configs"
git push personal main
```

## Step 2: Deploy Backend to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect repository: `bhanushrichinta-coder/alumni-portal`
4. Settings:
   - **Name**: `alumni-portal-backend`
   - **Root Directory**: `backend` (or leave empty)
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. **Environment Variables** (Add in Render dashboard):
   ```
   DATABASE_URL=your_neon_database_url
   SECRET_KEY=generate_secure_key_here
   AWS_ACCESS_KEY_ID=your_aws_access_key_here
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
   AWS_REGION=ap-south-1
   S3_BUCKET_NAME=ios-developer-tledch
   CORS_ORIGINS=*
   AUTO_SEED=true
   ```

6. Click "Create Web Service"
7. **Wait for deployment** → Copy the URL (e.g., `https://alumni-portal-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import from GitHub: `bhanushrichinta-coder/alumni-portal`
4. Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://alumni-portal-backend.onrender.com/api/v1
   ```
   (Use the actual Render URL from Step 2)

6. Click "Deploy"
7. **Copy Vercel URL** (e.g., `https://alumni-portal.vercel.app`)

## Step 4: Update CORS in Render

1. Go back to Render dashboard
2. Edit your web service
3. Update environment variable:
   ```
   CORS_ORIGINS=https://your-actual-vercel-url.vercel.app
   ```
4. Save and redeploy

## Step 5: Test

1. Open your Vercel URL
2. Login with:
   - Email: `john.doe@alumni.mit.edu`
   - Password: `password123`
3. Test features:
   - Create post with image
   - Admin delete post
   - Document requests

## ✅ Done!

Your app is now live on:
- Frontend: https://your-app.vercel.app
- Backend: https://your-backend.onrender.com

