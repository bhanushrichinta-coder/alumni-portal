"""
User management endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from app.db.session import get_async_session
from app.repositories.user_repository import UserRepository
from app.repositories.university_repository import UniversityRepository
from app.schemas.user import UserResponse, UserUpdate, UserCreate
from app.api.dependencies import (
    get_current_active_user, 
    require_super_admin, 
    require_university_admin
)
from app.models.user import User, UserRole
from app.core.security import get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Update current user"""
    user_repo = UserRepository(session)
    updated = await user_repo.update(current_user.id, user_data)
    return updated


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_university_admin),  # University admin and super admin can list
    session: AsyncSession = Depends(get_async_session)
):
    """List users (university admin and super admin only)
    - University admins see only users from their university
    - Super admins see all users
    """
    user_repo = UserRepository(session)
    
    # University admins can only see users from their university
    current_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if current_role == UserRole.UNIVERSITY_ADMIN.value:
        if not current_user.university_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="University admin must be associated with a university"
            )
        # Filter by university_id
        from sqlalchemy import select
        result = await session.execute(
            select(User)
            .where(User.university_id == current_user.university_id)
            .offset(skip)
            .limit(limit)
            .order_by(User.created_at.desc())
        )
        users = list(result.scalars().all())
    else:
        # Super admin sees all users
        users = await user_repo.list_users(skip, limit)
    
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_university_admin),  # University admin and super admin can view
    session: AsyncSession = Depends(get_async_session)
):
    """Get user by ID (university admin and super admin only)"""
    user_repo = UserRepository(session)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # University admins can only view users from their university
    current_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if current_role == UserRole.UNIVERSITY_ADMIN.value:
        if user.university_id != current_user.university_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view users from your university"
            )
    
    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_university_admin),  # University admin and super admin can create
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new user (admin only) - Used to grant access to alumni"""
    user_repo = UserRepository(session)
    university_repo = UniversityRepository(session)
    
    # Check if user already exists
    existing_user = await user_repo.get_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    existing_username = await user_repo.get_by_username(user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Determine university_id and role
    current_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    university_id = None
    role = UserRole.ALUMNI  # Default to alumni
    
    # University admins can only create alumni for their university
    if current_role == UserRole.UNIVERSITY_ADMIN.value:
        if not current_user.university_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="University admin must be associated with a university"
            )
        university_id = current_user.university_id
        role = UserRole.ALUMNI  # University admins can only create alumni
    elif current_role == UserRole.SUPER_ADMIN.value:
        # Super admin can create any user type and assign to any university
        # For now, defaulting to alumni unless specified
        # You can extend this to accept role in user_data if needed
        university_id = None  # Can be set later or via user_data
    
    # Create user with access granted (is_verified=True)
    hashed_password = get_password_hash(user_data.password)
    user = await user_repo.create(user_data, hashed_password)
    
    # Update user with university_id, role, and is_verified
    from app.schemas.user import UserUpdate
    update_data = UserUpdate(
        role=role,
        is_verified=True,  # Grant access immediately
        is_active=True
    )
    if university_id:
        # Note: UserUpdate doesn't have university_id, so we need to update it directly
        await session.execute(
            update(User).where(User.id == user.id).values(
                university_id=university_id,
                role=role,
                is_verified=True,
                is_active=True
            )
        )
        await session.commit()
        await session.refresh(user)
    else:
        updated = await user_repo.update(user.id, update_data)
        if updated:
            user = updated
    
    return user


