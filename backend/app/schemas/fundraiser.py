from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FundraiserCreate(BaseModel):
    """Create fundraiser schema."""
    title: str
    description: Optional[str] = None
    image: Optional[str] = None
    goal_amount: float
    donation_link: Optional[str] = None
    start_date: datetime
    end_date: datetime


class FundraiserUpdate(BaseModel):
    """Update fundraiser schema."""
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    goal_amount: Optional[float] = None
    current_amount: Optional[float] = None
    donation_link: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class FundraiserResponse(BaseModel):
    """Fundraiser response schema."""
    id: str
    university_id: str
    title: str
    description: Optional[str] = None
    image: Optional[str] = None
    goal_amount: float
    current_amount: float
    donation_link: Optional[str] = None
    start_date: str
    end_date: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class DonationCreate(BaseModel):
    """Create donation schema."""
    amount: float
    donor_name: Optional[str] = None
    is_anonymous: bool = False
    message: Optional[str] = None


class DonationResponse(BaseModel):
    """Donation response schema."""
    id: str
    fundraiser_id: str
    amount: float
    donor_name: Optional[str] = None
    is_anonymous: bool
    message: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class FundraiserListResponse(BaseModel):
    """List of fundraisers response."""
    fundraisers: List[FundraiserResponse]
    total: int

