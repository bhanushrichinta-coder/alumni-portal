from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.support import SupportTicket, TicketResponse, TicketStatus, TicketPriority, TicketCategory
from app.models.university import University
from app.schemas.support import (
    SupportTicketCreate, SupportTicketUpdate, SupportTicketResponse,
    TicketResponseCreate, TicketResponseResponse, SupportTicketListResponse
)

router = APIRouter()


@router.get("/tickets", response_model=SupportTicketListResponse)
async def list_tickets(
    status_filter: Optional[str] = None,
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List support tickets for the current user.
    """
    query = db.query(SupportTicket).filter(
        SupportTicket.user_id == current_user.id
    )
    
    if status_filter:
        try:
            status_enum = TicketStatus(status_filter)
            query = query.filter(SupportTicket.status == status_enum)
        except ValueError:
            pass
    
    if category:
        try:
            category_enum = TicketCategory(category)
            query = query.filter(SupportTicket.category == category_enum)
        except ValueError:
            pass
    
    query = query.order_by(SupportTicket.created_at.desc())
    
    total = query.count()
    tickets = query.offset((page - 1) * page_size).limit(page_size).all()
    
    ticket_responses = []
    for ticket in tickets:
        responses = db.query(TicketResponse).filter(
            TicketResponse.ticket_id == ticket.id
        ).order_by(TicketResponse.created_at.asc()).all()
        
        response_list = [
            TicketResponseResponse(
                id=r.id,
                message=r.message,
                responder_name=r.responder_name,
                is_admin=r.is_admin,
                created_at=r.created_at
            )
            for r in responses
        ]
        
        ticket_responses.append(SupportTicketResponse(
            id=ticket.id,
            subject=ticket.subject,
            category=ticket.category.value,
            priority=ticket.priority.value,
            description=ticket.description,
            status=ticket.status.value,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
            responses=response_list
        ))
    
    return SupportTicketListResponse(
        tickets=ticket_responses,
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("/tickets", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_data: SupportTicketCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new support ticket.
    """
    try:
        category = TicketCategory(ticket_data.category)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of: {[c.value for c in TicketCategory]}"
        )
    
    try:
        priority = TicketPriority(ticket_data.priority)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid priority. Must be one of: {[p.value for p in TicketPriority]}"
        )
    
    ticket = SupportTicket(
        user_id=current_user.id,
        user_name=current_user.name,
        user_email=current_user.email,
        university_id=current_user.university_id,
        subject=ticket_data.subject,
        category=category,
        priority=priority,
        description=ticket_data.description
    )
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    return SupportTicketResponse(
        id=ticket.id,
        subject=ticket.subject,
        category=ticket.category.value,
        priority=ticket.priority.value,
        description=ticket.description,
        status=ticket.status.value,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        responses=[]
    )


@router.get("/tickets/{ticket_id}", response_model=SupportTicketResponse)
async def get_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific support ticket.
    """
    ticket = db.query(SupportTicket).filter(
        SupportTicket.id == ticket_id,
        SupportTicket.user_id == current_user.id
    ).first()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    responses = db.query(TicketResponse).filter(
        TicketResponse.ticket_id == ticket.id
    ).order_by(TicketResponse.created_at.asc()).all()
    
    response_list = [
        TicketResponseResponse(
            id=r.id,
            message=r.message,
            responder_name=r.responder_name,
            is_admin=r.is_admin,
            created_at=r.created_at
        )
        for r in responses
    ]
    
    return SupportTicketResponse(
        id=ticket.id,
        subject=ticket.subject,
        category=ticket.category.value,
        priority=ticket.priority.value,
        description=ticket.description,
        status=ticket.status.value,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        responses=response_list
    )


@router.put("/tickets/{ticket_id}", response_model=SupportTicketResponse)
async def update_ticket(
    ticket_id: str,
    ticket_data: SupportTicketUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a support ticket.
    """
    ticket = db.query(SupportTicket).filter(
        SupportTicket.id == ticket_id,
        SupportTicket.user_id == current_user.id
    ).first()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    if ticket_data.subject is not None:
        ticket.subject = ticket_data.subject
    if ticket_data.description is not None:
        ticket.description = ticket_data.description
    if ticket_data.priority is not None:
        try:
            ticket.priority = TicketPriority(ticket_data.priority)
        except ValueError:
            pass
    
    db.commit()
    db.refresh(ticket)
    
    responses = db.query(TicketResponse).filter(
        TicketResponse.ticket_id == ticket.id
    ).order_by(TicketResponse.created_at.asc()).all()
    
    response_list = [
        TicketResponseResponse(
            id=r.id,
            message=r.message,
            responder_name=r.responder_name,
            is_admin=r.is_admin,
            created_at=r.created_at
        )
        for r in responses
    ]
    
    return SupportTicketResponse(
        id=ticket.id,
        subject=ticket.subject,
        category=ticket.category.value,
        priority=ticket.priority.value,
        description=ticket.description,
        status=ticket.status.value,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        responses=response_list
    )


@router.post("/tickets/{ticket_id}/respond", response_model=TicketResponseResponse, status_code=status.HTTP_201_CREATED)
async def respond_to_ticket(
    ticket_id: str,
    response_data: TicketResponseCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Add a response to a support ticket.
    """
    ticket = db.query(SupportTicket).filter(
        SupportTicket.id == ticket_id,
        SupportTicket.user_id == current_user.id
    ).first()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    if ticket.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot respond to a closed ticket"
        )
    
    response = TicketResponse(
        ticket_id=ticket_id,
        responder_name=current_user.name,
        is_admin=False,
        message=response_data.message
    )
    
    db.add(response)
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(response)
    
    return TicketResponseResponse(
        id=response.id,
        message=response.message,
        responder_name=response.responder_name,
        is_admin=response.is_admin,
        created_at=response.created_at
    )


@router.post("/tickets/{ticket_id}/close")
async def close_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Close a support ticket.
    """
    ticket = db.query(SupportTicket).filter(
        SupportTicket.id == ticket_id,
        SupportTicket.user_id == current_user.id
    ).first()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    ticket.status = TicketStatus.CLOSED
    ticket.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Ticket closed successfully", "success": True}

