# Media Upload Fix

## Issues Fixed

1. **Better Error Handling**: Added detailed error messages for S3 upload failures
2. **File Size Validation**: Added validation for file sizes (50MB for images, 500MB for videos)
3. **Improved Logging**: Added comprehensive logging to help debug upload issues
4. **Frontend Error Handling**: Improved error messages in the frontend API client

## Common Issues and Solutions

### Issue 1: "S3 client not initialized"
**Cause**: S3 credentials not configured in Render environment variables

**Solution**: Add these environment variables in Render:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name
```

### Issue 2: "Access Denied" or "403 Forbidden"
**Cause**: AWS IAM user doesn't have S3 permissions or bucket policy is incorrect

**Solution**:
1. Check IAM user has these permissions:
   - `s3:PutObject`
   - `s3:PutObjectAcl`
   - `s3:GetObject` (optional, for reading)
2. Check bucket policy allows public read for uploaded files

### Issue 3: "File too large"
**Cause**: File exceeds size limits (50MB for images, 500MB for videos)

**Solution**: Compress the file or use a smaller file

### Issue 4: CORS Error
**Cause**: CORS not properly configured for file uploads

**Solution**: Already fixed - CORS allows all headers and methods

## Testing

1. **Test Image Upload**:
   - Go to Dashboard
   - Click "Create Post"
   - Click "Add Photo"
   - Select an image
   - Click "Post"
   - Check if image appears in the feed

2. **Test Video Upload**:
   - Same steps but select "Add Video"
   - Note: Videos may take longer to upload

3. **Check Render Logs**:
   - Go to Render Dashboard → Your service → Logs
   - Look for:
     - "Uploading image/video: filename"
     - "File uploaded successfully: URL"
     - Or error messages if upload fails

## Expected Behavior

✅ **Success**:
- File uploads to S3
- Returns public URL
- Post created with media URL
- Image/video displays in feed

❌ **Failure**:
- Error message shown in UI
- Detailed error in Render logs
- Post may still be created but without media

## Next Steps

If uploads still fail:
1. Check Render logs for specific error messages
2. Verify S3 credentials are correct
3. Test S3 access from AWS Console
4. Check bucket permissions and CORS settings

