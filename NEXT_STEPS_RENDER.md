# 🎉 Backend Deployed! Next Steps

## ✅ Your Backend is Live!

**Backend URL**: `https://alumni-portal-yw7q.onrender.com`  
**API Base URL**: `https://alumni-portal-yw7q.onrender.com/api/v1`

## 📋 Next Steps

### 1. Update Environment Variables in Render

Go to your Render dashboard and make sure these are set:

1. Click on your service → "Environment" tab
2. Add/Update these variables:

```
DATABASE_URL=your_neon_database_url
SECRET_KEY=generate_secure_key_here
AWS_ACCESS_KEY_ID=your_aws_access_key_from_env_file
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_from_env_file
AWS_REGION=ap-south-1
S3_BUCKET_NAME=ios-developer-tledch
CORS_ORIGINS=*
AUTO_SEED=true
```

3. **Important**: After adding variables, click "Save Changes" and the service will redeploy

### 2. Deploy Frontend to Vercel

1. Go to: https://vercel.com
2. Click "Add New" → "Project"
3. Import: `bhanushrichinta-coder/alumni-portal`
4. Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variable**:
   ```
   VITE_API_BASE_URL=https://alumni-portal-yw7q.onrender.com/api/v1
   ```

6. Click "Deploy"
7. **Copy your Vercel URL** (e.g., `https://alumni-portal.vercel.app`)

### 3. Update CORS in Render

1. Go back to Render dashboard
2. Edit your service → "Environment" tab
3. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://your-vercel-url.vercel.app
   ```
   (Replace with your actual Vercel URL)

4. Save and redeploy

### 4. Test Your Deployment

1. Open your Vercel URL
2. Try logging in:
   - Email: `john.doe@alumni.mit.edu`
   - Password: `password123`

3. Test features:
   - Create post with image
   - Admin delete post
   - Document requests

## 🐛 Troubleshooting

### If signin doesn't work:

1. **Check CORS**: Make sure `CORS_ORIGINS` includes your Vercel URL
2. **Check API URL**: Verify `VITE_API_BASE_URL` in Vercel matches Render URL
3. **Check Database**: Ensure `AUTO_SEED=true` (database should seed automatically)
4. **Check Logs**: 
   - Render: Click "Logs" tab in your service
   - Browser: Press F12 → Console tab

### If backend is slow:

- Free Render instances spin down after 15 minutes of inactivity
- First request after spin-down takes ~50 seconds
- This is normal for free tier

### Test Backend Directly:

```bash
curl https://alumni-portal-yw7q.onrender.com/health
```

Should return: `{"status":"ok"}`

## ✅ Checklist

- [ ] Environment variables set in Render
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_BASE_URL` set in Vercel
- [ ] `CORS_ORIGINS` updated in Render with Vercel URL
- [ ] Tested login on Vercel URL
- [ ] Tested creating posts
- [ ] Tested admin features

## 🎯 Your URLs

- **Backend**: https://alumni-portal-yw7q.onrender.com
- **API**: https://alumni-portal-yw7q.onrender.com/api/v1
- **Frontend**: (Your Vercel URL - deploy next!)

Everything is ready! Deploy frontend to Vercel and update CORS! 🚀

