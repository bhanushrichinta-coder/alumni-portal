# Testing Guide - Alumni Portal Features

## 🚀 Servers Started

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:5173 (or check terminal output)

## 📋 Test Credentials

From `seed_data.py`, use these credentials:

### Super Admin
- **Email**: `superadmin@alumni.connect`
- **Password**: `password123`

### MIT Admin
- **Email**: `admin@mit.edu`
- **Password**: `password123`

### MIT Alumni
- **Email**: `john.doe@alumni.mit.edu`
- **Password**: `password123`
- **Email**: `jane.smith@alumni.mit.edu`
- **Password**: `password123`

### Stanford Admin
- **Email**: `admin@stanford.edu`
- **Password**: `password123`

### Stanford Alumni
- **Email**: `alice.johnson@alumni.stanford.edu`
- **Password**: `password123`

## ✅ Testing Checklist

### 1. Login & Authentication
- [ ] Login as alumni user
- [ ] Login as admin user
- [ ] Login as super admin
- [ ] Verify correct dashboard loads for each role

### 2. Post Creation with Media (S3 Upload)
- [ ] Create a text-only post
- [ ] Create a post with an image
  - Click "Add Photo" in post modal
  - Select an image file
  - Verify upload progress indicator
  - Submit post
  - Verify image displays in feed
- [ ] Create a post with a video
  - Click "Add Video" in post modal
  - Select a video file
  - Verify upload progress indicator
  - Submit post
  - Verify video displays in feed
- [ ] Check S3 bucket to confirm files uploaded

### 3. Admin Post Deletion
- [ ] Login as admin (`admin@mit.edu`)
- [ ] Navigate to Dashboard/Feed
- [ ] Find a post (not created by you)
- [ ] Click the three dots (⋯) menu
- [ ] Verify "Remove Post (Admin)" option appears
- [ ] Delete the post
- [ ] Verify post is removed from feed
- [ ] Login as alumni and verify they can delete their own posts

### 4. Document Requests
- [ ] Login as alumni user
- [ ] Navigate to Documents page
- [ ] Click "Request" tab
- [ ] Select document type (e.g., "Official Transcript")
- [ ] Enter reason for request
- [ ] Submit request
- [ ] Verify request appears in "Recent Requests" with "pending" status

### 5. Admin Document Management
- [ ] Login as admin (`admin@mit.edu`)
- [ ] Navigate to Admin Dashboard
- [ ] Go to Documents section
- [ ] View pending document requests
- [ ] Approve a request
  - Click "Approve" on a pending request
  - Verify status changes to "approved"
- [ ] Reject a request
  - Click "Reject" on another request
  - Verify status changes to "rejected"
- [ ] Login back as alumni and verify notification/status update

### 6. Lead Intelligence (Super Admin Only)
- [ ] Login as super admin (`superadmin@alumni.connect`)
- [ ] Navigate to Super Admin Dashboard
- [ ] Go to Lead Intelligence section
- [ ] Verify lead data is displayed
  - Check lead scores and categories (hot/warm/cold)
  - Verify ad clicks data
  - Verify career roadmap requests
- [ ] Check top performing ads
- [ ] Check most requested career paths

### 7. Feed Features
- [ ] Verify posts appear in feed
- [ ] Test like functionality
- [ ] Test comment functionality
- [ ] Test share functionality
- [ ] Verify post tags display correctly
- [ ] Test filtering posts by type/tag

## 🐛 Troubleshooting

### Backend Not Starting
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend Not Starting
```bash
npm install
npm run dev
```

### S3 Upload Fails
1. Check `.env` file has correct AWS credentials
2. Verify S3 bucket permissions
3. Check browser console for errors
4. Verify CORS is configured on S3 bucket

### Database Issues
```bash
cd backend
source venv/bin/activate
python seed_data.py
```

### No Posts/Data Showing
- Run seed script: `python backend/seed_data.py`
- Check database connection in `.env`
- Verify AUTO_SEED is set correctly

## 📝 Expected Results

### Post with Image
- Image should upload to: `alumni-portal-posts-uploads/images/{uuid}.{ext}`
- Image should display in the post
- URL should be: `https://ios-developer-tledch.s3.ap-south-1.amazonaws.com/alumni-portal-posts-uploads/images/...`

### Post with Video
- Video should upload to: `alumni-portal-posts-uploads/videos/{uuid}.{ext}`
- Video thumbnail should display
- Video should be playable

### Admin Delete
- Admin should see delete option on all posts
- Post should be removed from feed immediately
- Other users should not see deleted post

### Document Request
- Request should appear in admin dashboard
- Status should update when admin approves/rejects
- User should receive notification

## 🔍 API Endpoints to Test

- `POST /api/v1/posts/upload-media` - Upload image/video
- `POST /api/v1/posts` - Create post
- `DELETE /api/v1/posts/{id}` - Delete post (admin/owner)
- `POST /api/v1/documents/requests` - Create document request
- `GET /api/v1/admin/documents` - Get document requests (admin)
- `PUT /api/v1/admin/documents/{id}/status` - Update request status
- `GET /api/v1/lead-intelligence/leads` - Get leads (super admin)

## 📊 Success Criteria

✅ All features work as expected
✅ No console errors
✅ Media uploads successfully to S3
✅ Admin can delete posts
✅ Document requests flow works end-to-end
✅ Lead intelligence data displays correctly

