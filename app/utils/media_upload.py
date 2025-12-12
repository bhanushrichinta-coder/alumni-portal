"""
Media upload utilities for images and videos
"""
import os
import aiofiles
from typing import Optional, Tuple
from pathlib import Path
from fastapi import UploadFile
from app.core.config import settings
from app.core.logging import logger
from app.models.post_media import MediaType


# Allowed image extensions
ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'}
# Allowed video extensions
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'}


def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return Path(filename).suffix.lower().lstrip('.')


def is_allowed_image(filename: str) -> bool:
    """Check if file is an allowed image type"""
    ext = get_file_extension(filename)
    return ext in ALLOWED_IMAGE_EXTENSIONS


def is_allowed_video(filename: str) -> bool:
    """Check if file is an allowed video type"""
    ext = get_file_extension(filename)
    return ext in ALLOWED_VIDEO_EXTENSIONS


def get_media_type(filename: str, mime_type: Optional[str] = None) -> Optional[MediaType]:
    """Determine media type from filename or MIME type"""
    ext = get_file_extension(filename)
    
    # Check by extension first
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return MediaType.IMAGE
    elif ext in ALLOWED_VIDEO_EXTENSIONS:
        return MediaType.VIDEO
    
    # Check by MIME type if extension doesn't match
    if mime_type:
        if mime_type.startswith('image/'):
            return MediaType.IMAGE
        elif mime_type.startswith('video/'):
            return MediaType.VIDEO
    
    return None


async def save_media_file(
    upload_file: UploadFile, 
    user_id: int, 
    post_id: Optional[int] = None
) -> Tuple[Optional[str], Optional[str], Optional[MediaType], Optional[int]]:
    """
    Save uploaded media file (image or video) to disk
    Returns: (file_path, file_name, media_type, file_size) or (None, None, None, None) on error
    """
    # Check if it's an allowed image or video
    media_type = get_media_type(upload_file.filename, upload_file.content_type)
    if not media_type:
        logger.warning(f"File type not allowed: {upload_file.filename}")
        return None, None, None, None
    
    # Create upload directory structure: uploads/posts/{user_id}/{post_id}/
    if post_id:
        upload_dir = Path(settings.UPLOAD_DIR) / "posts" / str(user_id) / str(post_id)
    else:
        # Temporary upload before post creation
        upload_dir = Path(settings.UPLOAD_DIR) / "posts" / str(user_id) / "temp"
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_ext = get_file_extension(upload_file.filename)
    import uuid
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = upload_dir / unique_filename

    try:
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await upload_file.read()
            file_size = len(content)
            
            # Check file size (images: 10MB, videos: 100MB)
            max_size = settings.MAX_UPLOAD_SIZE if media_type == MediaType.IMAGE else settings.MAX_VIDEO_SIZE
            if file_size > max_size:
                logger.warning(f"File too large: {upload_file.filename} ({file_size} bytes)")
                return None, None, None, None
            
            await f.write(content)

        return str(file_path), unique_filename, media_type, file_size
    except Exception as e:
        logger.error(f"Error saving media file: {str(e)}")
        return None, None, None, None


def get_media_url(file_path: str) -> str:
    """Convert file path to URL for serving media files"""
    # In production, this would be a CDN URL or static file server URL
    # For now, return a relative path that can be served by FastAPI static files
    # Remove the base upload directory from path
    relative_path = file_path.replace(settings.UPLOAD_DIR, "").lstrip("/")
    return f"/media/{relative_path}"

