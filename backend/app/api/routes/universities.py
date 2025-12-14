from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

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


def parse_colors(colors_str):
    """Parse colors JSON string to UniversityBrandingResponse."""
    if not colors_str:
        return None
    try:
        colors_data = json.loads(colors_str) if isinstance(colors_str, str) else colors_str
        return UniversityBrandingResponse(
            light=UniversityBrandingColors(
                primary=colors_data.get("light", {}).get("primary", "#000000"),
                secondary=colors_data.get("light", {}).get("secondary", "#666666"),
                accent=colors_data.get("light", {}).get("accent", "#000000")
            ),
            dark=UniversityBrandingColors(
                primary=colors_data.get("dark", {}).get("primary", "#FFFFFF"),
                secondary=colors_data.get("dark", {}).get("secondary", "#CCCCCC"),
                accent=colors_data.get("dark", {}).get("accent", "#FFFFFF")
            )
        )
    except (json.JSONDecodeError, KeyError, TypeError):
        return None


@router.get("/", response_model=UniversityListResponse)
async def list_universities(db: Session = Depends(get_db)):
    """
    Get all universities (public endpoint).
    """
    universities = db.query(University).filter(University.is_enabled == True).all()
    
    responses = []
    for uni in universities:
        colors = parse_colors(uni.colors)
        
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
    
    colors = parse_colors(university.colors)
    
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
    
    colors = parse_colors(university.colors)
    
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
    
    # Get existing colors or create new
    existing_colors = {}
    if university.colors:
        try:
            existing_colors = json.loads(university.colors) if isinstance(university.colors, str) else university.colors
        except:
            existing_colors = {}
    
    # Update colors
    light_colors = existing_colors.get("light", {})
    dark_colors = existing_colors.get("dark", {})
    
    if branding_data.light_primary is not None:
        light_colors["primary"] = branding_data.light_primary
    if branding_data.light_secondary is not None:
        light_colors["secondary"] = branding_data.light_secondary
    if branding_data.light_accent is not None:
        light_colors["accent"] = branding_data.light_accent
    
    if branding_data.dark_primary is not None:
        dark_colors["primary"] = branding_data.dark_primary
    if branding_data.dark_secondary is not None:
        dark_colors["secondary"] = branding_data.dark_secondary
    if branding_data.dark_accent is not None:
        dark_colors["accent"] = branding_data.dark_accent
    
    # Save updated colors
    university.colors = json.dumps({
        "light": light_colors,
        "dark": dark_colors
    })
    
    db.commit()
    db.refresh(university)
    
    return UniversityBrandingResponse(
        light=UniversityBrandingColors(
            primary=light_colors.get("primary", "#000000"),
            secondary=light_colors.get("secondary", "#666666"),
            accent=light_colors.get("accent", "#000000")
        ),
        dark=UniversityBrandingColors(
            primary=dark_colors.get("primary", "#FFFFFF"),
            secondary=dark_colors.get("secondary", "#CCCCCC"),
            accent=dark_colors.get("accent", "#FFFFFF")
        )
    )
