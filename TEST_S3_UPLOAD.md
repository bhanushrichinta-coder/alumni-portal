# Testing S3 Media Uploads

## Quick Test Steps

### 1. Verify .env Configuration
Make sure your `.env` file in `backend/` has:
```env
AWS_ACCESS_KEY_ID=your_actual_key
AWS_SECRET_ACCESS_KEY=your_actual_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=ios-developer-tledch
```

### 2. Test the Backend API

Start your backend server:
```bash
cd backend
uvicorn app.main:app --reload
```

### 3. Test Upload Endpoint

You can test the upload endpoint using curl:

```bash
# Test image upload
curl -X POST "http://localhost:8000/api/v1/posts/upload-media" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/test-image.jpg" \
  -F "media_type=image"
```

### 4. Test from Frontend

1. **Start the frontend:**
   ```bash
   npm run dev
   ```

2. **Create a post with an image:**
   - Go to Dashboard
   - Click "Create Post"
   - Add an image
   - Post it

3. **Check S3 bucket:**
   - Go to AWS S3 Console
   - Navigate to `ios-developer-tledch` bucket
   - Check `alumni-portal-posts-uploads/images/` folder
   - You should see uploaded files

### 5. Verify File URLs

After uploading, check the post response - it should contain:
- `media_url` for images
- `video_url` for videos
- URLs should be: `https://ios-developer-tledch.s3.amazonaws.com/alumni-portal-posts-uploads/images/{uuid}.{ext}`

## Troubleshooting

### Issue: "S3 credentials not configured"
- Check that `.env` file is in `backend/` directory
- Verify credentials are correct (no extra spaces)
- Restart the backend server after changing `.env`

### Issue: "Access Denied" or "403 Forbidden"
- Check IAM user permissions
- Verify bucket policy allows public read
- Check CORS configuration

### Issue: Files not appearing in S3
- Check AWS CloudWatch logs
- Verify bucket name is correct
- Check region matches your bucket region

## Expected Behavior

✅ **Success:**
- File uploads to S3
- Returns public URL
- Post created with media URL
- Image/video displays in feed

❌ **Failure:**
- Error message in console
- Post created without media
- S3 service logs error

