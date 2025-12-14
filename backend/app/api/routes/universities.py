from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.api.routes.admin import require_admin
from app.models.user import User
from app.models.university import University
from app.schemas.university import (
    UniversityCreate, UniversityUpdate, UniversityResponse,
    UniversityBrandingUpdate, UniversityBrandingResponse, UniversityBrandingColors,
    UniversityListResponse
)

router = APIRouter()


@router.get("/", response_model=UniversityListResponse)
async def list_universities(db: Session = Depends(get_db)):
    """
    Get all universities (public endpoint).
    """
    universities = db.query(University).filter(University.is_enabled == True).all()
    
    responses = []
    for uni in universities:
        branding = db.query(UniversityBranding).filter(
            UniversityBranding.university_id == uni.id
        ).first()
        
        colors = None
        if branding:
            colors = UniversityBrandingResponse(
                light=UniversityBrandingColors(
                    primary=branding.light_primary,
                    secondary=branding.light_secondary,
                    accent=branding.light_accent
                ),
                dark=UniversityBrandingColors(
                    primary=branding.dark_primary,
                    secondary=branding.dark_secondary,
                    accent=branding.dark_accent
                )
            )
        
        responses.append(UniversityResponse(
            id=uni.id,
            name=uni.name,
            logo=uni.logo,
            is_enabled=uni.is_enabled,
            colors=colors,
            created_at=uni.created_at
        ))
    
    return UniversityListResponse(
        universities=responses,
        total=len(responses)
    )


@router.get("/{university_id}", response_model=UniversityResponse)
async def get_university(
    university_id: str,
    db: Session = Depends(get_db)
):
    """
    Get university by ID.
    """
    university = db.query(University).filter(University.id == university_id).first()
    
    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    branding = db.query(UniversityBranding).filter(
        UniversityBranding.university_id == university.id
    ).first()
    
    colors = None
    if branding:
        colors = UniversityBrandingResponse(
            light=UniversityBrandingColors(
                primary=branding.light_primary,
                secondary=branding.light_secondary,
                accent=branding.light_accent
            ),
            dark=UniversityBrandingColors(
                primary=branding.dark_primary,
                secondary=branding.dark_secondary,
                accent=branding.dark_accent
            )
        )
    
    return UniversityResponse(
        id=university.id,
        name=university.name,
        logo=university.logo,
        is_enabled=university.is_enabled,
        colors=colors,
        created_at=university.created_at
    )


@router.put("/{university_id}", response_model=UniversityResponse)
async def update_university(
    university_id: str,
    update_data: UniversityUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update university (admin only).
    """
    university = db.query(University).filter(University.id == university_id).first()
    
    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    # Check if admin has access to this university
    if current_user.role.value == "admin" and current_user.university_id != university_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this university"
        )
    
    if update_data.name is not None:
        university.name = update_data.name
    if update_data.logo is not None:
        university.logo = update_data.logo
    if update_data.is_enabled is not None:
        university.is_enabled = update_data.is_enabled
    
    db.commit()
    db.refresh(university)
    
    branding = db.query(UniversityBranding).filter(
        UniversityBranding.university_id == university.id
    ).first()
    
    colors = None
    if branding:
        colors = UniversityBrandingResponse(
            light=UniversityBrandingColors(
                primary=branding.light_primary,
                secondary=branding.light_secondary,
                accent=branding.light_accent
            ),
            dark=UniversityBrandingColors(
                primary=branding.dark_primary,
                secondary=branding.dark_secondary,
                accent=branding.dark_accent
            )
        )
    
    return UniversityResponse(
        id=university.id,
        name=university.name,
        logo=university.logo,
        is_enabled=university.is_enabled,
        colors=colors,
        created_at=university.created_at
    )


@router.put("/{university_id}/branding", response_model=UniversityBrandingResponse)
async def update_university_branding(
    university_id: str,
    branding_data: UniversityBrandingUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update university branding colors (admin only).
    """
    university = db.query(University).filter(University.id == university_id).first()
    
    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    # Check if admin has access to this university
    if current_user.role.value == "admin" and current_user.university_id != university_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this university"
        )
    
    branding = db.query(UniversityBranding).filter(
        UniversityBranding.university_id == university_id
    ).first()
    
    if not branding:
        branding = UniversityBranding(university_id=university_id)
        db.add(branding)
    
    if branding_data.light_primary is not None:
        branding.light_primary = branding_data.light_primary
    if branding_data.light_secondary is not None:
        branding.light_secondary = branding_data.light_secondary
    if branding_data.light_accent is not None:
        branding.light_accent = branding_data.light_accent
    if branding_data.dark_primary is not None:
        branding.dark_primary = branding_data.dark_primary
    if branding_data.dark_secondary is not None:
        branding.dark_secondary = branding_data.dark_secondary
    if branding_data.dark_accent is not None:
        branding.dark_accent = branding_data.dark_accent
    
    db.commit()
    db.refresh(branding)
    
    return UniversityBrandingResponse(
        light=UniversityBrandingColors(
            primary=branding.light_primary,
            secondary=branding.light_secondary,
            accent=branding.light_accent
        ),
        dark=UniversityBrandingColors(
            primary=branding.dark_primary,
            secondary=branding.dark_secondary,
            accent=branding.dark_accent
        )
    )

