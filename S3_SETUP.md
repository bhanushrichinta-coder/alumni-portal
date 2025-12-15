# S3 Configuration Guide

## Your S3 Setup
- **Bucket Name:** `ios-developer-tledch`
- **Base Folder:** `alumni-portal-posts-uploads/`
- **Subfolders:** 
  - `alumni-portal-posts-uploads/images/` (for image uploads)
  - `alumni-portal-posts-uploads/videos/` (for video uploads)

## Environment Variables

Add these to your `.env` file in the `backend/` directory:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=ios-developer-tledch
```

## S3 Bucket Permissions

Make sure your S3 bucket has the following permissions:

### 1. Bucket Policy (for public read access to uploaded files)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ios-developer-tledch/alumni-portal-posts-uploads/*"
        }
    ]
}
```

### 2. CORS Configuration
Add this CORS configuration to your bucket:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

### 3. Block Public Access Settings
- Uncheck "Block all public access" OR
- Keep it checked but ensure the bucket policy allows public read for the specific folder

## Testing

After configuring, test the upload by:
1. Creating a post with an image
2. Creating a post with a video
3. Check the S3 bucket to verify files are uploaded to:
   - `alumni-portal-posts-uploads/images/`
   - `alumni-portal-posts-uploads/videos/`

## File Structure

Files will be uploaded with this structure:
```
ios-developer-tledch/
└── alumni-portal-posts-uploads/
    ├── images/
    │   ├── {uuid}.jpg
    │   ├── {uuid}.png
    │   └── ...
    └── videos/
        ├── {uuid}.mp4
        ├── {uuid}.mov
        └── ...
```

## URL Format

Uploaded files will be accessible at:
- Images: `https://ios-developer-tledch.s3.amazonaws.com/alumni-portal-posts-uploads/images/{uuid}.{ext}`
- Videos: `https://ios-developer-tledch.s3.amazonaws.com/alumni-portal-posts-uploads/videos/{uuid}.{ext}`

