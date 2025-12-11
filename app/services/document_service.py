"""
Document service with vector database integration
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, UploadFile
from app.repositories.document_repository import DocumentRepository
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentSearchQuery, DocumentSearchResult
from app.models.document import DocumentStatus
from app.utils.file_upload import save_upload_file, get_document_type, extract_text_from_file
from app.utils.embeddings import embedding_service
from app.utils.vector_db import vector_db_service
from app.core.logging import logger
import uuid


class DocumentService:
    """Service for document operations"""

    def __init__(self, session: AsyncSession):
        self.document_repo = DocumentRepository(session)
        self.session = session

    async def upload_document(
        self,
        file: UploadFile,
        document_data: DocumentCreate,
        uploader_id: int
    ) -> dict:
        """Upload and process document"""
        # Save file
        file_path, file_name = await save_upload_file(file, uploader_id)
        if not file_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to save file"
            )

        # Get file info
        file_type = get_document_type(file.filename)
        file_size = file.size or 0

        # Create document record
        file_info = {
            "file_path": file_path,
            "file_name": file_name,
            "file_size": file_size,
            "file_type": file_type,
            "mime_type": file.content_type or "application/octet-stream"
        }

        # Get uploader's university_id
        from app.repositories.user_repository import UserRepository
        user_repo = UserRepository(self.session)
        uploader = await user_repo.get_by_id(uploader_id)
        university_id = uploader.university_id if uploader else None
        
        document = await self.document_repo.create(document_data, file_info, uploader_id, university_id)

        # Process document asynchronously (in production, use Celery)
        # For now, process synchronously
        await self._process_document(document.id)

        return {"document": document, "message": "Document uploaded successfully"}

    async def _process_document(self, document_id: int) -> None:
        """Process document: extract text, generate embeddings, store in vector DB"""
        document = await self.document_repo.get_by_id(document_id)
        if not document:
            return

        try:
            # Update status to processing
            await self.document_repo.update_status(document_id, DocumentStatus.PROCESSING)

            # Extract text from file
            text = await extract_text_from_file(document.file_path, document.file_type)
            if not text:
                raise Exception("Failed to extract text from document")

            # Chunk text
            chunks = embedding_service.chunk_text(text)

            # Generate embeddings
            embeddings = await embedding_service.generate_embeddings_batch(chunks)
            if not embeddings or any(e is None for e in embeddings):
                raise Exception("Failed to generate embeddings")

            # Prepare metadata for vector DB
            chroma_id = str(uuid.uuid4())
            metadatas = []
            ids = []

            for i, chunk in enumerate(chunks):
                metadata = {
                    "document_id": str(document_id),
                    "chunk_index": i,
                    "title": document.title,
                    "file_type": document.file_type.value
                }
                # Add university_id to metadata for filtering
                if document.university_id:
                    metadata["university_id"] = str(document.university_id)
                metadatas.append(metadata)
                ids.append(f"{chroma_id}_chunk_{i}")

                # Store embedding record in database
                await self.document_repo.create_embedding(
                    document_id,
                    {
                        "chunk_index": i,
                        "chunk_text": chunk,
                        "embedding_vector_id": ids[-1],
                        "metadata": str(metadata)
                    }
                )

            # Add to vector database
            success = vector_db_service.add_document(
                document_id=chroma_id,
                embeddings=embeddings,
                texts=chunks,
                metadatas=metadatas,
                ids=ids
            )

            if success:
                await self.document_repo.update_status(document_id, DocumentStatus.PROCESSED, chroma_id)
                logger.info(f"Document {document_id} processed successfully")
            else:
                raise Exception("Failed to add document to vector database")

        except Exception as e:
            logger.error(f"Error processing document {document_id}: {str(e)}")
            await self.document_repo.update_status(document_id, DocumentStatus.FAILED)

    async def search_documents(self, query: DocumentSearchQuery, user_id: Optional[int] = None) -> List[DocumentSearchResult]:
        """Search documents using vector similarity"""
        # Generate query embedding
        query_embedding = await embedding_service.generate_embedding(query.query)
        if not query_embedding:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate query embedding"
            )

        # Search vector database with university filtering
        filter_metadata = query.filter_metadata or {}
        
        # Get user's university_id for filtering
        if user_id:
            from app.repositories.user_repository import UserRepository
            user_repo = UserRepository(self.session)
            user = await user_repo.get_by_id(user_id)
            if user and user.university_id:
                # Filter by user's university
                filter_metadata["university_id"] = str(user.university_id)

        results = vector_db_service.search(
            query_embedding=query_embedding,
            n_results=query.limit,
            filter_metadata=filter_metadata if filter_metadata else None
        )

        # Format results
        search_results = []
        for result in results:
            document_id = int(result['metadata'].get('document_id', 0))
            document = await self.document_repo.get_by_id(document_id)
            if document:
                # Check access: public or user's university or user's own document
                has_access = (
                    document.is_public or 
                    document.uploader_id == user_id or
                    (user_id and user and document.university_id == user.university_id)
                )
                if has_access:
                    search_results.append(DocumentSearchResult(
                        document_id=document_id,
                        document_title=document.title,
                        chunk_text=result['document'],
                        chunk_index=result['metadata'].get('chunk_index', 0),
                        similarity_score=1.0 - result['distance'] if result['distance'] else 0.0,
                        metadata=result['metadata']
                    ))

        return search_results

    async def get_document(self, document_id: int, user_id: Optional[int] = None) -> dict:
        """Get document by ID"""
        document = await self.document_repo.get_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        # Check access: public, user's own, or user's university
        if user_id:
            from app.repositories.user_repository import UserRepository
            user_repo = UserRepository(self.session)
            user = await user_repo.get_by_id(user_id)
            has_access = (
                document.is_public or 
                document.uploader_id == user_id or
                (user and document.university_id and document.university_id == user.university_id)
            )
        else:
            has_access = document.is_public
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        return document

    async def list_documents(self, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[dict]:
        """List documents (filtered by user's university)"""
        if user_id:
            # Get user's university_id
            from app.repositories.user_repository import UserRepository
            user_repo = UserRepository(self.session)
            user = await user_repo.get_by_id(user_id)
            university_id = user.university_id if user else None
            
            if university_id:
                # List documents from user's university
                documents = await self.document_repo.list_documents_by_university(skip, limit, university_id)
            else:
                # User has no university, show only public documents
                documents = await self.document_repo.list_public_documents(skip, limit)
        else:
            # No user, show only public documents
            documents = await self.document_repo.list_public_documents(skip, limit)
        return documents

    async def update_document(self, document_id: int, document_data: DocumentUpdate, user_id: int) -> dict:
        """Update document"""
        document = await self.document_repo.get_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        if document.uploader_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this document"
            )

        updated = await self.document_repo.update(document_id, document_data)
        return updated

    async def delete_document(self, document_id: int, user_id: int) -> bool:
        """Delete document"""
        document = await self.document_repo.get_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        if document.uploader_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this document"
            )

        # Delete from vector DB
        if document.chroma_id:
            vector_db_service.delete_document(document.chroma_id)

        # Delete from database
        await self.document_repo.delete(document_id)
        return True


