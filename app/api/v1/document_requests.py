"""
Document request endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.db.session import get_async_session
from app.api.dependencies import get_current_active_user, require_university_admin
from app.models.user import User, UserRole
from app.models.document_request import DocumentRequest, DocumentRequestStatus, DocumentRequestType
from app.schemas.document_request import (
    DocumentRequestCreate, DocumentRequestUpdate, 
    DocumentRequestResponse, DocumentRequestListResponse
)
from app.core.logging import logger

router = APIRouter(prefix="/document-requests", tags=["Document Requests"])


@router.post("/", response_model=DocumentRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_document_request(
    request_data: DocumentRequestCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new document request (alumni only)"""
    # Only alumni can request documents
    if current_user.role != UserRole.ALUMNI:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only alumni can request documents"
        )
    
    # User must have a university
    if not current_user.university_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be associated with a university to request documents"
        )
    
    # Create request
    document_request = DocumentRequest(
        document_type=request_data.document_type,
        reason=request_data.reason,
        status=DocumentRequestStatus.PENDING,
        requestor_id=current_user.id,
        university_id=current_user.university_id
    )
    
    session.add(document_request)
    await session.commit()
    await session.refresh(document_request)
    
    # Load relationships
    await session.refresh(document_request, ["requestor", "university", "processed_by"])
    
    return DocumentRequestResponse(
        id=document_request.id,
        document_type=document_request.document_type,
        reason=document_request.reason,
        status=document_request.status,
        requestor_id=document_request.requestor_id,
        university_id=document_request.university_id,
        requestor_name=document_request.requestor.full_name or document_request.requestor.username,
        university_name=document_request.university.name if document_request.university else None,
        admin_notes=document_request.admin_notes,
        processed_by_id=document_request.processed_by_id,
        processed_by_name=document_request.processed_by.full_name if document_request.processed_by else None,
        processed_at=document_request.processed_at,
        created_at=document_request.created_at,
        updated_at=document_request.updated_at
    )


@router.get("/", response_model=DocumentRequestListResponse)
async def list_document_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[DocumentRequestStatus] = Query(None),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """List document requests
    
    - Alumni: See only their own requests
    - University Admin: See all requests from their university
    """
    # Build query based on user role
    if current_user.role == UserRole.ALUMNI:
        # Alumni see only their own requests
        query = select(DocumentRequest).where(DocumentRequest.requestor_id == current_user.id)
    elif current_user.role == UserRole.UNIVERSITY_ADMIN:
        # University admin sees requests from their university
        if not current_user.university_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="University admin must be associated with a university"
            )
        query = select(DocumentRequest).where(DocumentRequest.university_id == current_user.university_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view document requests"
        )
    
    # Apply status filter if provided
    if status_filter:
        query = query.where(DocumentRequest.status == status_filter)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await session.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination and ordering
    query = query.order_by(DocumentRequest.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    # Execute query
    result = await session.execute(query)
    requests = result.scalars().all()
    
    # Load relationships and build response
    request_responses = []
    for req in requests:
        await session.refresh(req, ["requestor", "university", "processed_by"])
        request_responses.append(DocumentRequestResponse(
            id=req.id,
            document_type=req.document_type,
            reason=req.reason,
            status=req.status,
            requestor_id=req.requestor_id,
            university_id=req.university_id,
            requestor_name=req.requestor.full_name or req.requestor.username,
            university_name=req.university.name if req.university else None,
            admin_notes=req.admin_notes,
            processed_by_id=req.processed_by_id,
            processed_by_name=req.processed_by.full_name if req.processed_by else None,
            processed_at=req.processed_at,
            created_at=req.created_at,
            updated_at=req.updated_at
        ))
    
    total_pages = (total + page_size - 1) // page_size
    
    return DocumentRequestListResponse(
        requests=request_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{request_id}", response_model=DocumentRequestResponse)
async def get_document_request(
    request_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Get a single document request by ID"""
    result = await session.execute(
        select(DocumentRequest).where(DocumentRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document request not found"
        )
    
    # Check permissions
    if current_user.role == UserRole.ALUMNI:
        # Alumni can only see their own requests
        if request.requestor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own document requests"
            )
    elif current_user.role == UserRole.UNIVERSITY_ADMIN:
        # University admin can see requests from their university
        if request.university_id != current_user.university_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view document requests from your university"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this document request"
        )
    
    # Load relationships
    await session.refresh(request, ["requestor", "university", "processed_by"])
    
    return DocumentRequestResponse(
        id=request.id,
        document_type=request.document_type,
        reason=request.reason,
        status=request.status,
        requestor_id=request.requestor_id,
        university_id=request.university_id,
        requestor_name=request.requestor.full_name or request.requestor.username,
        university_name=request.university.name if request.university else None,
        admin_notes=request.admin_notes,
        processed_by_id=request.processed_by_id,
        processed_by_name=request.processed_by.full_name if request.processed_by else None,
        processed_at=request.processed_at,
        created_at=request.created_at,
        updated_at=request.updated_at
    )


@router.put("/{request_id}", response_model=DocumentRequestResponse)
async def update_document_request(
    request_id: int,
    update_data: DocumentRequestUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Update document request status (university admin only)"""
    # Only university admins can update requests
    if current_user.role != UserRole.UNIVERSITY_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only university admins can update document request status"
        )
    
    # Get request
    result = await session.execute(
        select(DocumentRequest).where(DocumentRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document request not found"
        )
    
    # University admin can only update requests from their university
    if current_user.role == UserRole.UNIVERSITY_ADMIN:
        if request.university_id != current_user.university_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update document requests from your university"
            )
    
    # Update request
    request.status = update_data.status
    request.admin_notes = update_data.admin_notes
    request.processed_by_id = current_user.id
    from datetime import datetime
    request.processed_at = datetime.utcnow().isoformat()
    
    await session.commit()
    await session.refresh(request)
    
    # Load relationships
    await session.refresh(request, ["requestor", "university", "processed_by"])
    
    return DocumentRequestResponse(
        id=request.id,
        document_type=request.document_type,
        reason=request.reason,
        status=request.status,
        requestor_id=request.requestor_id,
        university_id=request.university_id,
        requestor_name=request.requestor.full_name or request.requestor.username,
        university_name=request.university.name if request.university else None,
        admin_notes=request.admin_notes,
        processed_by_id=request.processed_by_id,
        processed_by_name=request.processed_by.full_name if request.processed_by else None,
        processed_at=request.processed_at,
        created_at=request.created_at,
        updated_at=request.updated_at
    )

