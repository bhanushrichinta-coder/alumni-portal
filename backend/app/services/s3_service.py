"""
S3 Service for media uploads (images and videos)
"""
import boto3
from botocore.exceptions import ClientError
from typing import Optional, Tuple
import uuid
from pathlib import Path
from fastapi import UploadFile
from app.core.config import settings
from app.core.logging import logger


class S3Service:
    """Service for S3 operations"""
    
    def __init__(self):
        self.bucket_name = getattr(settings, 'S3_BUCKET_NAME', None)
        self.region = getattr(settings, 'AWS_REGION', 'us-east-1')
        self.access_key = getattr(settings, 'AWS_ACCESS_KEY_ID', None)
        self.secret_key = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None)
        
        if not all([self.bucket_name, self.access_key, self.secret_key]):
            logger.warning("S3 credentials not configured. Media uploads will fail.")
            self.s3_client = None
        else:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region
            )
    
    def _get_file_extension(self, filename: str) -> str:
        """Get file extension from filename"""
        return Path(filename).suffix.lower().lstrip('.')
    
    def _generate_key(self, folder: str, filename: str, file_ext: str) -> str:
        """Generate S3 key for file"""
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        # Use alumni-portal-posts-uploads as base folder
        base_folder = "alumni-portal-posts-uploads"
        return f"{base_folder}/{folder}/{unique_filename}"
    
    async def upload_file(
        self,
        file: UploadFile,
        folder: str = "media",
        content_type: Optional[str] = None
    ) -> Optional[str]:
        """
        Upload file to S3
        Returns: S3 URL or None on error
        """
        if not self.s3_client:
            logger.error("S3 client not initialized. Check credentials.")
            return None
        
        try:
            file_ext = self._get_file_extension(file.filename)
            key = self._generate_key(folder, file.filename, file_ext)
            
            # Read file content
            file_content = await file.read()
            
            # Determine content type
            if not content_type:
                content_type = file.content_type or 'application/octet-stream'
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_content,
                ContentType=content_type,
                ACL='public-read'  # Make files publicly accessible
            )
            
            # Generate public URL
            # Handle different S3 URL formats based on region
            # us-east-1 doesn't include region in URL, all other regions do
            if self.region == 'us-east-1':
                url = f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
            else:
                # For ap-south-1 and other regions, include region in URL
                url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{key}"
            
            logger.info(f"File uploaded successfully: {url}")
            return url
            
        except ClientError as e:
            logger.error(f"Error uploading file to S3: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error uploading file: {str(e)}")
            return None
    
    async def upload_image(
        self,
        file: UploadFile,
        folder: str = "images"
    ) -> Optional[str]:
        """Upload image file to S3"""
        return await self.upload_file(file, folder=folder, content_type=file.content_type)
    
    async def upload_video(
        self,
        file: UploadFile,
        folder: str = "videos"
    ) -> Optional[str]:
        """Upload video file to S3"""
        return await self.upload_file(file, folder=folder, content_type=file.content_type)
    
    def delete_file(self, url: str) -> bool:
        """
        Delete file from S3 using URL
        Returns: True if successful, False otherwise
        """
        if not self.s3_client:
            return False
        
        try:
            # Extract key from URL
            # URL format: https://bucket-name.s3.region.amazonaws.com/key
            if '.s3.' in url:
                key = url.split('.s3.')[1].split('.amazonaws.com/')[1]
            else:
                logger.error(f"Invalid S3 URL format: {url}")
                return False
            
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            logger.info(f"File deleted successfully: {key}")
            return True
            
        except ClientError as e:
            logger.error(f"Error deleting file from S3: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error deleting file: {str(e)}")
            return False


# Global S3 service instance
s3_service = S3Service()

