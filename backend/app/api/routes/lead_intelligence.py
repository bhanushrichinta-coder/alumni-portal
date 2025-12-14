"""
Lead Intelligence API endpoints
For super admin to view lead intelligence data
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_superadmin
from app.models.user import User, UserRole
from app.models.lead_intelligence import AdClick, AdImpression, CareerRoadmapRequest, CareerRoadmapView
from app.models.ad import Ad
from app.models.university import University
from pydantic import BaseModel

router = APIRouter()


class LeadIntelligenceResponse(BaseModel):
    """Response model for lead intelligence"""
    user_id: str
    user_name: str
    user_email: str
    university_id: str
    university_name: str
    graduation_year: Optional[int] = None
    major: Optional[str] = None
    
    # Ad metrics
    ad_clicks: int = 0
    ad_impressions: int = 0
    clicked_ads: List[str] = []
    last_ad_interaction: Optional[datetime] = None
    
    # Career roadmap metrics
    roadmap_views: int = 0
    roadmap_generated: int = 0
    career_goals: List[str] = []
    
    # Calculated scores
    ad_engagement_score: float = 0.0
    career_engagement_score: float = 0.0
    overall_lead_score: float = 0.0
    lead_category: str = "cold"  # hot, warm, cold


class TopAdResponse(BaseModel):
    """Response for top performing ads"""
    ad_id: str
    ad_title: str
    clicks: int
    impressions: int
    ctr: float  # Click-through rate


class CareerPathResponse(BaseModel):
    """Response for career path popularity"""
    career_goal: str
    requests: int
    views: int


@router.get("/leads", response_model=List[LeadIntelligenceResponse])
async def get_lead_intelligence(
    university_id: Optional[str] = None,
    min_score: Optional[float] = Query(None, ge=0, le=100),
    category: Optional[str] = Query(None, regex="^(hot|warm|cold)$"),
    current_user: User = Depends(require_superadmin),
    db: Session = Depends(get_db)
):
    """
    Get lead intelligence data for all alumni.
    Only accessible by super admin.
    """
    # Get all alumni users
    query = db.query(User).filter(User.role == UserRole.ALUMNI)
    if university_id:
        query = query.filter(User.university_id == university_id)
    
    users = query.all()
    leads = []
    
    for user in users:
        # Get ad metrics
        ad_clicks = db.query(AdClick).filter(AdClick.user_id == user.id).count()
        ad_impressions = db.query(AdImpression).filter(AdImpression.user_id == user.id).count()
        
        clicked_ads = db.query(AdClick.ad_id).filter(AdClick.user_id == user.id).distinct().all()
        clicked_ad_ids = [ad_id[0] for ad_id in clicked_ads]
        
        last_click = db.query(AdClick).filter(AdClick.user_id == user.id).order_by(AdClick.clicked_at.desc()).first()
        last_ad_interaction = last_click.clicked_at if last_click else None
        
        # Get career roadmap metrics
        roadmap_requests = db.query(CareerRoadmapRequest).filter(
            CareerRoadmapRequest.user_id == user.id
        ).all()
        roadmap_views = db.query(CareerRoadmapView).filter(
            CareerRoadmapView.user_id == user.id
        ).count()
        
        career_goals = list(set([req.career_goal for req in roadmap_requests]))
        
        # Calculate scores
        ad_engagement_score = min(100, (ad_clicks * 3) + (ad_impressions / 10))
        career_engagement_score = min(100, (roadmap_views * 4) + (len(roadmap_requests) * 10))
        overall_lead_score = (ad_engagement_score * 0.4) + (career_engagement_score * 0.4)
        
        # Categorize lead
        if overall_lead_score >= 70:
            lead_category = "hot"
        elif overall_lead_score >= 40:
            lead_category = "warm"
        else:
            lead_category = "cold"
        
        # Apply filters
        if min_score and overall_lead_score < min_score:
            continue
        if category and lead_category != category:
            continue
        
        university = db.query(University).filter(University.id == user.university_id).first()
        
        leads.append(LeadIntelligenceResponse(
            user_id=user.id,
            user_name=user.name,
            user_email=user.email,
            university_id=user.university_id or "",
            university_name=university.name if university else "",
            graduation_year=user.graduation_year,
            major=user.major,
            ad_clicks=ad_clicks,
            ad_impressions=ad_impressions,
            clicked_ads=clicked_ad_ids,
            last_ad_interaction=last_ad_interaction,
            roadmap_views=roadmap_views,
            roadmap_generated=len(roadmap_requests),
            career_goals=career_goals,
            ad_engagement_score=round(ad_engagement_score, 2),
            career_engagement_score=round(career_engagement_score, 2),
            overall_lead_score=round(overall_lead_score, 2),
            lead_category=lead_category
        ))
    
    # Sort by overall lead score descending
    leads.sort(key=lambda x: x.overall_lead_score, reverse=True)
    
    return leads


@router.get("/top-ads", response_model=List[TopAdResponse])
async def get_top_ads(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_superadmin),
    db: Session = Depends(get_db)
):
    """
    Get top performing ads by clicks.
    """
    # Get ad click counts
    ad_stats = db.query(
        Ad.id,
        Ad.title,
        func.count(AdClick.id).label('clicks'),
        func.count(AdImpression.id).label('impressions')
    ).outerjoin(AdClick, Ad.id == AdClick.ad_id).outerjoin(
        AdImpression, Ad.id == AdImpression.ad_id
    ).group_by(Ad.id, Ad.title).order_by(
        func.count(AdClick.id).desc()
    ).limit(limit).all()
    
    results = []
    for ad_id, ad_title, clicks, impressions in ad_stats:
        ctr = (clicks / impressions * 100) if impressions > 0 else 0.0
        results.append(TopAdResponse(
            ad_id=ad_id,
            ad_title=ad_title,
            clicks=clicks or 0,
            impressions=impressions or 0,
            ctr=round(ctr, 2)
        ))
    
    return results


@router.get("/career-paths", response_model=List[CareerPathResponse])
async def get_career_paths(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_superadmin),
    db: Session = Depends(get_db)
):
    """
    Get most requested career paths.
    """
    # Get career goal statistics
    career_stats = db.query(
        CareerRoadmapRequest.career_goal,
        func.count(CareerRoadmapRequest.id).label('requests'),
        func.count(CareerRoadmapView.id).label('views')
    ).outerjoin(
        CareerRoadmapView,
        CareerRoadmapRequest.id == CareerRoadmapView.roadmap_request_id
    ).group_by(CareerRoadmapRequest.career_goal).order_by(
        func.count(CareerRoadmapRequest.id).desc()
    ).limit(limit).all()
    
    results = []
    for career_goal, requests, views in career_stats:
        results.append(CareerPathResponse(
            career_goal=career_goal,
            requests=requests or 0,
            views=views or 0
        ))
    
    return results

