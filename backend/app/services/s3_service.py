"""
S3 Service for media uploads (images, videos, and documents)
Uses CloudFront for serving files when configured
Supports large file uploads up to 500MB using multipart upload
"""
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
from typing import Optional, Tuple
import uuid
from pathlib import Path
from fastapi import UploadFile
from app.core.config import settings
from app.core.logging import logger

# Configure boto3 for large file uploads
BOTO_CONFIG = Config(
    retries={'max_attempts': 3, 'mode': 'adaptive'},
    max_pool_connections=50,
    connect_timeout=60,
    read_timeout=300  # 5 minutes for large uploads
)

# Multipart upload threshold (100MB)
MULTIPART_THRESHOLD = 100 * 1024 * 1024
# Multipart chunk size (50MB)
MULTIPART_CHUNKSIZE = 50 * 1024 * 1024


class S3Service:
    """Service for S3 operations with CloudFront support and large file handling"""
    
    def __init__(self):
        self.bucket_name = getattr(settings, 'S3_BUCKET_NAME', None)
        self.region = getattr(settings, 'AWS_REGION', 'ap-south-1')
        self.access_key = getattr(settings, 'AWS_ACCESS_KEY_ID', None)
        self.secret_key = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None)
        self.cloudfront_url = getattr(settings, 'CLOUDFRONT_URL', None)
        
        # Clean CloudFront URL (remove trailing slash if present)
        if self.cloudfront_url:
            self.cloudfront_url = self.cloudfront_url.rstrip('/')
        
        if not all([self.bucket_name, self.access_key, self.secret_key]):
            logger.warning("S3 credentials not configured. Media uploads will fail.")
            logger.warning(f"  Bucket: {self.bucket_name}, Access Key: {'SET' if self.access_key else 'NOT SET'}, Secret Key: {'SET' if self.secret_key else 'NOT SET'}")
            self.s3_client = None
        else:
            try:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    region_name=self.region,
                    config=BOTO_CONFIG
                )
                logger.info(f"S3 Service initialized: Bucket={self.bucket_name}, Region={self.region}, CloudFront={'YES' if self.cloudfront_url else 'NO'}")
            except Exception as e:
                logger.error(f"Failed to initialize S3 client: {e}")
                self.s3_client = None
    
    def is_configured(self) -> bool:
        """Check if S3 is properly configured"""
        return self.s3_client is not None
    
    def _get_file_extension(self, filename: str) -> str:
        """Get file extension from filename"""
        return Path(filename).suffix.lower().lstrip('.')
    
    def _generate_key(self, folder: str, filename: str, file_ext: str) -> str:
        """Generate S3 key for file"""
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        # Use alumni-portal as base folder
        base_folder = "alumni-portal"
        return f"{base_folder}/{folder}/{unique_filename}"
    
    def _get_public_url(self, key: str) -> str:
        """
        Get public URL for the uploaded file.
        Uses CloudFront if configured, otherwise falls back to S3 URL.
        """
        if self.cloudfront_url:
            # Use CloudFront URL
            return f"{self.cloudfront_url}/{key}"
        else:
            # Fall back to S3 URL
            if self.region == 'us-east-1':
                return f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
            else:
                return f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{key}"
    
    def _multipart_upload(self, key: str, file_content: bytes, content_type: str) -> bool:
        """
        Perform multipart upload for large files
        """
        try:
            # Initiate multipart upload
            response = self.s3_client.create_multipart_upload(
                Bucket=self.bucket_name,
                Key=key,
                ContentType=content_type
            )
            upload_id = response['UploadId']
            
            parts = []
            part_number = 1
            
            # Upload parts
            for i in range(0, len(file_content), MULTIPART_CHUNKSIZE):
                chunk = file_content[i:i + MULTIPART_CHUNKSIZE]
                
                part_response = self.s3_client.upload_part(
                    Bucket=self.bucket_name,
                    Key=key,
                    PartNumber=part_number,
                    UploadId=upload_id,
                    Body=chunk
                )
                
                parts.append({
                    'PartNumber': part_number,
                    'ETag': part_response['ETag']
                })
                
                logger.info(f"Uploaded part {part_number} ({len(chunk)} bytes)")
                part_number += 1
            
            # Complete multipart upload
            self.s3_client.complete_multipart_upload(
                Bucket=self.bucket_name,
                Key=key,
                UploadId=upload_id,
                MultipartUpload={'Parts': parts}
            )
            
            logger.info(f"Multipart upload completed: {key}")
            return True
            
        except Exception as e:
            logger.error(f"Multipart upload failed: {e}")
            # Try to abort the multipart upload
            try:
                self.s3_client.abort_multipart_upload(
                    Bucket=self.bucket_name,
                    Key=key,
                    UploadId=upload_id
                )
            except:
                pass
            return False
    
    async def upload_file(
        self,
        file: UploadFile,
        folder: str = "media",
        content_type: Optional[str] = None
    ) -> Optional[str]:
        """
        Upload file to S3 (supports files up to 500MB)
        Uses multipart upload for files > 100MB
        Returns: CloudFront/S3 URL or None on error
        """
        if not self.s3_client:
            error_msg = "S3 client not initialized. Please configure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME in environment variables."
            logger.error(error_msg)
            return None
        
        key = None
        try:
            file_ext = self._get_file_extension(file.filename)
            key = self._generate_key(folder, file.filename, file_ext)
            
            # Read file content
            file_content = await file.read()
            file_size = len(file_content)
            
            # Determine content type
            if not content_type:
                content_type = file.content_type or 'application/octet-stream'
            
            logger.info(f"Uploading to S3: {key} ({file_size / (1024*1024):.2f} MB, {content_type})")
            
            # Use multipart upload for large files
            if file_size > MULTIPART_THRESHOLD:
                logger.info(f"Using multipart upload for large file ({file_size / (1024*1024):.2f} MB)")
                success = self._multipart_upload(key, file_content, content_type)
                if not success:
                    return None
            else:
                # Regular upload for smaller files
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=file_content,
                    ContentType=content_type
                )
            
            # Generate public URL (CloudFront or S3)
            url = self._get_public_url(key)
            
            logger.info(f"File uploaded successfully: {url}")
            return url
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_msg = e.response.get('Error', {}).get('Message', str(e))
            logger.error(f"AWS S3 Error ({error_code}): {error_msg}")
            logger.error(f"Bucket: {self.bucket_name}, Region: {self.region}, Key: {key}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error uploading file to S3: {str(e)}")
            logger.exception(e)
            return None
    
    async def upload_file_from_bytes(
        self,
        file_content: bytes,
        filename: str,
        folder: str = "media",
        content_type: str = "application/octet-stream"
    ) -> Optional[str]:
        """
        Upload file to S3 from bytes (supports files up to 500MB)
        Returns: CloudFront/S3 URL or None on error
        """
        if not self.s3_client:
            logger.error("S3 client not initialized")
            return None
        
        key = None
        try:
            file_ext = self._get_file_extension(filename)
            key = self._generate_key(folder, filename, file_ext)
            file_size = len(file_content)
            
            logger.info(f"Uploading to S3: {key} ({file_size / (1024*1024):.2f} MB, {content_type})")
            
            # Use multipart upload for large files
            if file_size > MULTIPART_THRESHOLD:
                logger.info(f"Using multipart upload for large file ({file_size / (1024*1024):.2f} MB)")
                success = self._multipart_upload(key, file_content, content_type)
                if not success:
                    return None
            else:
                # Regular upload for smaller files
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=file_content,
                    ContentType=content_type
                )
            
            # Generate public URL
            url = self._get_public_url(key)
            
            logger.info(f"File uploaded successfully: {url}")
            return url
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_msg = e.response.get('Error', {}).get('Message', str(e))
            logger.error(f"AWS S3 Error ({error_code}): {error_msg}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error uploading file to S3: {str(e)}")
            return None
    
    async def upload_image(
        self,
        file: UploadFile,
        folder: str = "images"
    ) -> Optional[str]:
        """Upload image file to S3 (max 100MB)"""
        return await self.upload_file(file, folder=folder, content_type=file.content_type)
    
    async def upload_video(
        self,
        file: UploadFile,
        folder: str = "videos"
    ) -> Optional[str]:
        """Upload video file to S3 (max 500MB)"""
        return await self.upload_file(file, folder=folder, content_type=file.content_type)
    
    async def upload_document(
        self,
        file: UploadFile,
        folder: str = "documents"
    ) -> Optional[str]:
        """Upload document file to S3 (max 500MB)"""
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
            key = None
            
            # Handle CloudFront URL
            if self.cloudfront_url and url.startswith(self.cloudfront_url):
                key = url.replace(f"{self.cloudfront_url}/", "")
            # Handle S3 URL
            elif '.s3.' in url:
                # URL format: https://bucket-name.s3.region.amazonaws.com/key
                parts = url.split('.amazonaws.com/')
                if len(parts) > 1:
                    key = parts[1]
            elif '.s3.amazonaws.com/' in url:
                key = url.split('.s3.amazonaws.com/')[1]
            
            if not key:
                logger.error(f"Could not extract key from URL: {url}")
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
