# Post Media (Images & Videos) Implementation Guide

## Overview

This document explains how images and videos are handled in the feed/posts section.

## Architecture

### 1. Database Model
- **PostMedia** table stores media files associated with posts
- Supports both images and videos
- Each post can have multiple media files
- Media files are ordered (for display order)

### 2. File Storage
- Images: Stored in `uploads/posts/{user_id}/{post_id}/`
- Videos: Same location, with optional thumbnails
- File size limits:
  - Images: 10MB max
  - Videos: 100MB max

### 3. Supported Formats

**Images:**
- jpg, jpeg, png, gif, webp, bmp, svg

**Videos:**
- mp4, mov, avi, mkv, webm, flv, wmv

## API Endpoints

### 1. Create Post with Media
**Endpoint:** `POST /api/v1/feed/posts`

**Request:** (multipart/form-data)
```
content: "Post text content"
tag: "career_milestone" (optional)
company: "TechCorp" (optional)
media_files: [file1, file2, ...] (optional)
```

**Response:**
```json
{
  "id": 1,
  "content": "Post content...",
  "media": [
    {
      "id": 1,
      "post_id": 1,
      "media_type": "image",
      "file_name": "photo.jpg",
      "file_size": 1024000,
      "mime_type": "image/jpeg",
      "media_url": "/media/posts/5/1/abc123.jpg",
      "order": 0
    }
  ],
  ...
}
```

### 2. Upload Media to Existing Post
**Endpoint:** `POST /api/v1/feed/posts/{post_id}/media`

**Request:** (multipart/form-data)
```
file: <image or video file>
```

**Response:**
```json
{
  "id": 2,
  "post_id": 1,
  "media_type": "video",
  "file_name": "video.mp4",
  "file_size": 52428800,
  "mime_type": "video/mp4",
  "media_url": "/media/posts/5/1/def456.mp4",
  "order": 1
}
```

### 3. Delete Media
**Endpoint:** `DELETE /api/v1/feed/posts/{post_id}/media/{media_id}`

**Response:** 204 No Content

## Frontend Implementation

### Upload Flow

1. **User creates post:**
   - User types content
   - User clicks "Add Photo" or "Add Video"
   - Files are selected
   - Files are uploaded (can be done before or after post creation)

2. **Two approaches:**

   **Option A: Upload with post creation**
   - User selects media files
   - On "Post" click, send multipart form with content + files
   - Backend creates post and associates media

   **Option B: Upload after post creation**
   - User creates post first (text only)
   - Then uploads media files separately
   - Media files are associated with the post

### Display Flow

1. **List Posts:**
   - Fetch posts with media URLs
   - Display images in gallery/carousel
   - Display videos with play button
   - Show thumbnail for videos

2. **Single Post View:**
   - Show all media files
   - Images: Gallery view with zoom
   - Videos: Embedded player

## File Serving

Media files are served via FastAPI static file serving:

```python
from fastapi.staticfiles import StaticFiles
app.mount("/media", StaticFiles(directory="uploads"), name="media")
```

This allows accessing files at: `https://your-domain.com/media/posts/5/1/abc123.jpg`

## Security Considerations

1. **File Validation:**
   - Only allowed extensions accepted
   - File size limits enforced
   - MIME type validation

2. **Access Control:**
   - Only post author can upload/delete media
   - Media files are associated with posts (inherit post permissions)

3. **Storage:**
   - Files stored on server filesystem
   - In production, consider cloud storage (S3, Cloudinary, etc.)

## Future Enhancements

1. **Video Processing:**
   - Generate thumbnails for videos
   - Video compression/transcoding
   - Multiple quality levels

2. **Image Processing:**
   - Automatic image resizing
   - Thumbnail generation
   - Image optimization

3. **Cloud Storage:**
   - Migrate to S3/Cloudinary
   - CDN integration
   - Automatic backup

