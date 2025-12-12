from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.document import DocumentRequest, GeneratedDocument, DocumentStatus
from app.models.university import University
from app.schemas.document import (
    DocumentRequestCreate, DocumentRequestResponse, DocumentRequestListResponse,
    GeneratedDocumentCreate, GeneratedDocumentResponse
)

router = APIRouter()


@router.get("/requests", response_model=DocumentRequestListResponse)
async def list_document_requests(
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List document requests for the current user.
    """
    query = db.query(DocumentRequest).filter(
        DocumentRequest.user_id == current_user.id
    )
    
    if status_filter:
        try:
            status_enum = DocumentStatus(status_filter)
            query = query.filter(DocumentRequest.status == status_enum)
        except ValueError:
            pass
    
    query = query.order_by(DocumentRequest.requested_at.desc())
    
    total = query.count()
    requests = query.offset((page - 1) * page_size).limit(page_size).all()
    
    request_responses = []
    for req in requests:
        request_responses.append(DocumentRequestResponse(
            id=req.id,
            document_type=req.document_type,
            reason=req.reason,
            status=req.status.value,
            requested_at=req.requested_at,
            estimated_completion=req.estimated_completion
        ))
    
    return DocumentRequestListResponse(
        requests=request_responses,
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("/requests", response_model=DocumentRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_document_request(
    request_data: DocumentRequestCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new document request.
    """
    # Validate document type
    valid_types = [
        "Official Transcript",
        "Unofficial Transcript",
        "Enrollment Verification",
        "Degree Verification",
        "Recommendation Letter",
        "Certificate of Completion"
    ]
    
    if request_data.document_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document type. Must be one of: {', '.join(valid_types)}"
        )
    
    # Calculate estimated completion
    completion_days = 5 if "Transcript" in request_data.document_type else 7
    estimated_completion = datetime.utcnow().replace(day=datetime.utcnow().day + completion_days)
    
    doc_request = DocumentRequest(
        user_id=current_user.id,
        university_id=current_user.university_id,
        document_type=request_data.document_type,
        reason=request_data.reason,
        estimated_completion=estimated_completion
    )
    
    db.add(doc_request)
    db.commit()
    db.refresh(doc_request)
    
    return DocumentRequestResponse(
        id=doc_request.id,
        document_type=doc_request.document_type,
        reason=doc_request.reason,
        status=doc_request.status.value,
        requested_at=doc_request.requested_at,
        estimated_completion=doc_request.estimated_completion
    )


@router.get("/requests/{request_id}", response_model=DocumentRequestResponse)
async def get_document_request(
    request_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific document request.
    """
    doc_request = db.query(DocumentRequest).filter(
        DocumentRequest.id == request_id,
        DocumentRequest.user_id == current_user.id
    ).first()
    
    if not doc_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document request not found"
        )
    
    return DocumentRequestResponse(
        id=doc_request.id,
        document_type=doc_request.document_type,
        reason=doc_request.reason,
        status=doc_request.status.value,
        requested_at=doc_request.requested_at,
        estimated_completion=doc_request.estimated_completion
    )


@router.delete("/requests/{request_id}")
async def cancel_document_request(
    request_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a pending document request.
    """
    doc_request = db.query(DocumentRequest).filter(
        DocumentRequest.id == request_id,
        DocumentRequest.user_id == current_user.id
    ).first()
    
    if not doc_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document request not found"
        )
    
    if doc_request.status != DocumentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only cancel pending requests"
        )
    
    db.delete(doc_request)
    db.commit()
    
    return {"message": "Request cancelled successfully", "success": True}


# Generated Documents (AI-generated resumes, cover letters)
@router.get("/generated", response_model=List[GeneratedDocumentResponse])
async def list_generated_documents(
    doc_type: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List generated documents for the current user.
    """
    query = db.query(GeneratedDocument).filter(
        GeneratedDocument.user_id == current_user.id
    )
    
    if doc_type:
        query = query.filter(GeneratedDocument.document_type == doc_type)
    
    documents = query.order_by(GeneratedDocument.generated_at.desc()).all()
    
    return [
        GeneratedDocumentResponse(
            id=doc.id,
            document_type=doc.document_type,
            title=doc.title,
            content=doc.content,
            generated_at=doc.generated_at
        )
        for doc in documents
    ]


@router.post("/generated", response_model=GeneratedDocumentResponse, status_code=status.HTTP_201_CREATED)
async def generate_document(
    doc_data: GeneratedDocumentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Generate a document (Resume or Cover Letter) using AI.
    This is a mock implementation - in production, integrate with an AI service.
    """
    valid_types = ["Resume", "Cover Letter"]
    
    if doc_data.document_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document type. Must be one of: {', '.join(valid_types)}"
        )
    
    # Mock AI-generated content based on user profile
    if doc_data.document_type == "Resume":
        content = f"""
{current_user.name}
{current_user.email}

PROFESSIONAL SUMMARY
Results-driven professional with expertise in {doc_data.target_role or 'various fields'}. 
Seeking to leverage skills and experience to contribute to organizational success.

EXPERIENCE
{doc_data.experience or 'Experience details will be populated from profile.'}

EDUCATION
{current_user.major or 'Field of Study'} - {current_user.graduation_year or 'Year'}

SKILLS
{', '.join(doc_data.skills) if doc_data.skills else 'Skills will be populated from profile.'}
        """.strip()
    else:
        content = f"""
Dear Hiring Manager,

I am writing to express my strong interest in the {doc_data.target_role or 'position'} 
at {doc_data.company or 'your company'}. With my background in {current_user.major or 'my field'}, 
I am confident in my ability to make meaningful contributions to your team.

{doc_data.additional_info or ''}

Thank you for considering my application. I look forward to the opportunity to discuss 
how my skills and enthusiasm can benefit your organization.

Best regards,
{current_user.name}
        """.strip()
    
    generated_doc = GeneratedDocument(
        user_id=current_user.id,
        document_type=doc_data.document_type,
        title=f"{doc_data.document_type} - {doc_data.target_role or 'General'}" if doc_data.target_role else f"{doc_data.document_type} - {datetime.utcnow().strftime('%Y-%m-%d')}",
        content=content
    )
    
    db.add(generated_doc)
    db.commit()
    db.refresh(generated_doc)
    
    return GeneratedDocumentResponse(
        id=generated_doc.id,
        document_type=generated_doc.document_type,
        title=generated_doc.title,
        content=generated_doc.content,
        generated_at=generated_doc.generated_at
    )


@router.get("/generated/{document_id}", response_model=GeneratedDocumentResponse)
async def get_generated_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific generated document.
    """
    document = db.query(GeneratedDocument).filter(
        GeneratedDocument.id == document_id,
        GeneratedDocument.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return GeneratedDocumentResponse(
        id=document.id,
        document_type=document.document_type,
        title=document.title,
        content=document.content,
        generated_at=document.generated_at
    )


@router.delete("/generated/{document_id}")
async def delete_generated_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a generated document.
    """
    document = db.query(GeneratedDocument).filter(
        GeneratedDocument.id == document_id,
        GeneratedDocument.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully", "success": True}

