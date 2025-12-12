"""
Feed endpoints for posts, comments, and likes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.db.session import get_async_session
from app.api.dependencies import get_current_active_user, get_optional_user, require_university_admin
from app.models.user import User
from app.models.feed import Post, Comment, Like, PostStatus, PostTag
from app.models.post_media import PostMedia, MediaType
from app.schemas.feed import (
    PostCreate, PostUpdate, PostResponse, PostListResponse,
    CommentCreate, CommentResponse, LikeResponse
)
from app.schemas.post_media import PostMediaResponse
from app.utils.media_upload import save_media_file, get_media_url
from app.core.logging import logger

router = APIRouter(prefix="/feed", tags=["Feed"])


# ==================== HELPER FUNCTIONS ====================

async def get_post_media(post_id: int, session: AsyncSession) -> List[PostMediaResponse]:
    """Get all media files for a post"""
    media_result = await session.execute(
        select(PostMedia)
        .where(PostMedia.post_id == post_id)
        .order_by(PostMedia.order)
    )
    media_list = media_result.scalars().all()
    
    return [
        PostMediaResponse(
            id=m.id,
            post_id=m.post_id,
            media_type=m.media_type,
            file_path=m.file_path,
            file_name=m.file_name,
            file_size=m.file_size,
            mime_type=m.mime_type,
            thumbnail_path=m.thumbnail_path,
            order=m.order,
            media_url=get_media_url(m.file_path),
            thumbnail_url=get_media_url(m.thumbnail_path) if m.thumbnail_path else None
        ) for m in media_list
    ]


# ==================== POSTS ====================

@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new post"""
    # Get user's university
    university_id = current_user.university_id if current_user.university_id else None
    
    post = Post(
        content=post_data.content,
        author_id=current_user.id,
        university_id=university_id,
        status=PostStatus.ACTIVE,
        tag=post_data.tag,
        company=post_data.company
    )
    
    session.add(post)
    await session.commit()
    await session.refresh(post)
    
    # Load relationships
    await session.refresh(post, ["author", "university"])
    
    return PostResponse(
        id=post.id,
        content=post.content,
        author_id=post.author_id,
        author_name=post.author.full_name or post.author.username,
        university_id=post.university_id,
        university_name=post.university.name if post.university else None,
        status=post.status.value,
        is_pinned=post.is_pinned,
        likes_count=0,
        comments_count=0,
        user_liked=False,
        created_at=post.created_at,
        updated_at=post.updated_at,
        comments=[],
        likes=[]
    )


@router.get("/posts", response_model=PostListResponse)
async def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    university_id: Optional[int] = Query(None, description="Filter by university ID"),
    tag: Optional[str] = Query(None, description="Filter by tag: success_story, career_milestone, achievement, learning_journey, volunteering"),
    company: Optional[str] = Query(None, description="Filter by company name"),
    status_filter: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_optional_user),
    session: AsyncSession = Depends(get_async_session)
):
    """List posts with pagination and filters (tags, company, university)"""
    # Build query
    query = select(Post).where(Post.status == PostStatus.ACTIVE)
    
    # Filter by university if provided
    if university_id:
        query = query.where(Post.university_id == university_id)
    elif current_user and current_user.university_id:
        # If user has university, show posts from their university by default
        query = query.where(Post.university_id == current_user.university_id)
    
    # Filter by tag if provided
    if tag:
        try:
            tag_enum = PostTag(tag)
            query = query.where(Post.tag == tag_enum)
        except ValueError:
            # Invalid tag, ignore filter
            pass
    
    # Filter by company if provided
    if company:
        query = query.where(Post.company.ilike(f"%{company}%"))
    
    # Admin can see all statuses
    if status_filter and current_user:
        from app.models.user import UserRole
        is_admin = current_user.role in [UserRole.SUPER_ADMIN, UserRole.UNIVERSITY_ADMIN]
        if is_admin:
            if status_filter == "deleted":
                query = query.where(Post.status == PostStatus.DELETED)
            elif status_filter == "hidden":
                query = query.where(Post.status == PostStatus.HIDDEN)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await session.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination and ordering
    query = query.order_by(Post.is_pinned.desc(), Post.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    # Execute query
    result = await session.execute(query)
    posts = result.scalars().all()
    
    # Load relationships and build response
    post_responses = []
    for post in posts:
        # Get likes and comments count
        likes_count = await session.scalar(
            select(func.count(Like.id)).where(Like.post_id == post.id)
        ) or 0
        
        comments_count = await session.scalar(
            select(func.count(Comment.id)).where(
                and_(Comment.post_id == post.id, Comment.status == PostStatus.ACTIVE)
            )
        ) or 0
        
        # Check if current user liked this post
        user_liked = False
        if current_user:
            like_exists = await session.scalar(
                select(Like.id).where(
                    and_(Like.post_id == post.id, Like.user_id == current_user.id)
                )
            )
            user_liked = like_exists is not None
        
        # Get author and university names
        await session.refresh(post, ["author", "university"])
        
        # Get media files
        media = await get_post_media(post.id, session)
        
        post_responses.append(PostResponse(
            id=post.id,
            content=post.content,
            author_id=post.author_id,
            author_name=post.author.full_name or post.author.username,
            university_id=post.university_id,
            university_name=post.university.name if post.university else None,
            status=post.status.value,
            is_pinned=post.is_pinned,
            tag=post.tag.value if post.tag else None,
            company=post.company,
            likes_count=likes_count,
            comments_count=comments_count,
            user_liked=user_liked,
            media=media,
            created_at=post.created_at,
            updated_at=post.updated_at,
            comments=[],
            likes=[]
        ))
    
    total_pages = (total + page_size - 1) // page_size
    
    return PostListResponse(
        posts=post_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: int,
    current_user: Optional[User] = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Get a single post with comments and likes"""
    result = await session.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Get comments
    comments_result = await session.execute(
        select(Comment)
        .where(and_(Comment.post_id == post_id, Comment.status == PostStatus.ACTIVE))
        .order_by(Comment.created_at)
    )
    comments = comments_result.scalars().all()
    
    # Get likes
    likes_result = await session.execute(
        select(Like).where(Like.post_id == post_id)
    )
    likes = likes_result.scalars().all()
    
    # Check if current user liked
    user_liked = False
    if current_user:
        like_exists = await session.scalar(
            select(Like.id).where(
                and_(Like.post_id == post_id, Like.user_id == current_user.id)
            )
        )
        user_liked = like_exists is not None
    
    # Load relationships
    await session.refresh(post, ["author", "university"])
    for comment in comments:
        await session.refresh(comment, ["author"])
    for like in likes:
        await session.refresh(like, ["user"])
    
    # Get media files
    media = await get_post_media(post_id, session)
    
    return PostResponse(
        id=post.id,
        content=post.content,
        author_id=post.author_id,
        author_name=post.author.full_name or post.author.username,
        university_id=post.university_id,
        university_name=post.university.name if post.university else None,
        status=post.status.value,
        is_pinned=post.is_pinned,
        tag=post.tag.value if post.tag else None,
        company=post.company,
        likes_count=len(likes),
        comments_count=len(comments),
        user_liked=user_liked,
        media=media,
        created_at=post.created_at,
        updated_at=post.updated_at,
        comments=[
            CommentResponse(
                id=c.id,
                content=c.content,
                post_id=c.post_id,
                author_id=c.author_id,
                author_name=c.author.full_name or c.author.username,
                status=c.status.value,
                created_at=c.created_at,
                updated_at=c.updated_at
            ) for c in comments
        ],
        likes=[
            LikeResponse(
                id=l.id,
                post_id=l.post_id,
                user_id=l.user_id,
                user_name=l.user.full_name or l.user.username,
                created_at=l.created_at
            ) for l in likes
        ]
    )


@router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Update a post (only by author)"""
    result = await session.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if user is the author
    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own posts"
        )
    
    if post_data.content:
        post.content = post_data.content
    
    await session.commit()
    await session.refresh(post, ["author", "university"])
    
    # Get counts
    likes_count = await session.scalar(
        select(func.count(Like.id)).where(Like.post_id == post.id)
    ) or 0
    
    comments_count = await session.scalar(
        select(func.count(Comment.id)).where(
            and_(Comment.post_id == post.id, Comment.status == PostStatus.ACTIVE)
        )
    ) or 0
    
    user_liked = await session.scalar(
        select(Like.id).where(
            and_(Like.post_id == post.id, Like.user_id == current_user.id)
        )
    ) is not None
    
    return PostResponse(
        id=post.id,
        content=post.content,
        author_id=post.author_id,
        author_name=post.author.full_name or post.author.username,
        university_id=post.university_id,
        university_name=post.university.name if post.university else None,
        status=post.status.value,
        is_pinned=post.is_pinned,
        likes_count=likes_count,
        comments_count=comments_count,
        user_liked=user_liked,
        created_at=post.created_at,
        updated_at=post.updated_at,
        comments=[],
        likes=[]
    )


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a post (author or admin)"""
    result = await session.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if user is author or admin
    from app.models.user import UserRole
    is_admin = current_user.role in [UserRole.SUPER_ADMIN, UserRole.UNIVERSITY_ADMIN]
    is_author = post.author_id == current_user.id
    
    if not (is_admin or is_author):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own posts or be an admin"
        )
    
    post.status = PostStatus.DELETED
    await session.commit()
    
    return None


# ==================== COMMENTS ====================

@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Create a comment on a post"""
    # Check if post exists
    result = await session.execute(
        select(Post).where(and_(Post.id == post_id, Post.status == PostStatus.ACTIVE))
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    comment = Comment(
        content=comment_data.content,
        post_id=post_id,
        author_id=current_user.id,
        status=PostStatus.ACTIVE
    )
    
    session.add(comment)
    await session.commit()
    await session.refresh(comment, ["author"])
    
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        post_id=comment.post_id,
        author_id=comment.author_id,
        author_name=comment.author.full_name or comment.author.username,
        status=comment.status.value,
        created_at=comment.created_at,
        updated_at=comment.updated_at
    )


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a comment (author or admin)"""
    result = await session.execute(
        select(Comment).where(Comment.id == comment_id)
    )
    comment = result.scalar_one_or_none()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if user is author or admin
    from app.models.user import UserRole
    is_admin = current_user.role in [UserRole.SUPER_ADMIN, UserRole.UNIVERSITY_ADMIN]
    is_author = comment.author_id == current_user.id
    
    if not (is_admin or is_author):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments or be an admin"
        )
    
    comment.status = PostStatus.DELETED
    await session.commit()
    
    return None


# ==================== LIKES ====================

@router.post("/posts/{post_id}/like", response_model=dict)
async def toggle_like(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Toggle like on a post"""
    # Check if post exists
    result = await session.execute(
        select(Post).where(and_(Post.id == post_id, Post.status == PostStatus.ACTIVE))
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if like already exists
    existing_like = await session.scalar(
        select(Like).where(
            and_(Like.post_id == post_id, Like.user_id == current_user.id)
        )
    )
    
    if existing_like:
        # Unlike
        await session.delete(existing_like)
        await session.commit()
        return {"liked": False, "message": "Post unliked"}
    else:
        # Like
        like = Like(
            post_id=post_id,
            user_id=current_user.id
        )
        session.add(like)
        await session.commit()
        return {"liked": True, "message": "Post liked"}


# ==================== POST MEDIA ====================

@router.post("/posts/{post_id}/media", response_model=PostMediaResponse, status_code=status.HTTP_201_CREATED)
async def upload_post_media(
    post_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Upload media (image or video) to a post"""
    # Check if post exists and user is author
    result = await session.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if user is the author
    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add media to your own posts"
        )
    
    # Save media file
    file_path, file_name, media_type, file_size = await save_media_file(
        file, current_user.id, post_id
    )
    
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to save media file. Check file type and size limits."
        )
    
    # Get current max order for this post
    max_order_result = await session.execute(
        select(func.max(PostMedia.order)).where(PostMedia.post_id == post_id)
    )
    max_order = max_order_result.scalar() or -1
    next_order = max_order + 1
    
    # Create PostMedia record
    post_media = PostMedia(
        post_id=post_id,
        media_type=media_type,
        file_path=file_path,
        file_name=file_name,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        order=next_order
    )
    
    session.add(post_media)
    await session.commit()
    await session.refresh(post_media)
    
    return PostMediaResponse(
        id=post_media.id,
        post_id=post_media.post_id,
        media_type=post_media.media_type,
        file_path=post_media.file_path,
        file_name=post_media.file_name,
        file_size=post_media.file_size,
        mime_type=post_media.mime_type,
        thumbnail_path=post_media.thumbnail_path,
        order=post_media.order,
        media_url=get_media_url(post_media.file_path),
        thumbnail_url=get_media_url(post_media.thumbnail_path) if post_media.thumbnail_path else None
    )


@router.delete("/posts/{post_id}/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post_media(
    post_id: int,
    media_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Delete media from a post"""
    # Check if post exists
    result = await session.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if user is the author
    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete media from your own posts"
        )
    
    # Get media
    media_result = await session.execute(
        select(PostMedia).where(
            and_(PostMedia.id == media_id, PostMedia.post_id == post_id)
        )
    )
    media = media_result.scalar_one_or_none()
    
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )
    
    # Delete file from disk
    import os
    from pathlib import Path
    try:
        if os.path.exists(media.file_path):
            os.remove(media.file_path)
        if media.thumbnail_path and os.path.exists(media.thumbnail_path):
            os.remove(media.thumbnail_path)
    except Exception as e:
        logger.warning(f"Error deleting media file: {str(e)}")
    
    # Delete from database
    await session.delete(media)
    await session.commit()
    
    return None


# ==================== FILTER OPTIONS ====================

@router.get("/posts/filters/options", response_model=dict)
async def get_filter_options(
    current_user: Optional[User] = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Get available filter options for posts (tags, companies, universities)"""
    # Get all available tags
    tags = [tag.value for tag in PostTag]
    tag_labels = {
        "success_story": "Success Story",
        "career_milestone": "Career Milestone",
        "achievement": "Achievement",
        "learning_journey": "Learning Journey",
        "volunteering": "Volunteering"
    }
    
    # Get distinct companies from posts
    companies_result = await session.execute(
        select(Post.company)
        .where(and_(Post.company.isnot(None), Post.status == PostStatus.ACTIVE))
        .distinct()
        .order_by(Post.company)
    )
    companies = [row[0] for row in companies_result.all() if row[0]]
    
    # Get universities (from user's university or all if super admin)
    from app.models.university import University
    from app.models.user import UserRole
    
    if current_user and current_user.role == UserRole.SUPER_ADMIN:
        # Super admin sees all universities
        universities_result = await session.execute(
            select(University.id, University.name)
            .order_by(University.name)
        )
    elif current_user and current_user.university_id:
        # User sees their university
        universities_result = await session.execute(
            select(University.id, University.name)
            .where(University.id == current_user.university_id)
        )
    else:
        # Get all universities with posts
        universities_result = await session.execute(
            select(University.id, University.name)
            .join(Post, University.id == Post.university_id)
            .where(Post.status == PostStatus.ACTIVE)
            .distinct()
            .order_by(University.name)
        )
    
    universities = [
        {"id": row[0], "name": row[1]} 
        for row in universities_result.all()
    ]
    
    return {
        "tags": [
            {"value": tag, "label": tag_labels.get(tag, tag.replace("_", " ").title())}
            for tag in tags
        ],
        "companies": companies,
        "universities": universities
    }


# ==================== ADMIN ENDPOINTS ====================

@router.get("/admin/posts", response_model=PostListResponse)
async def admin_list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    university_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_university_admin),
    session: AsyncSession = Depends(get_async_session)
):
    """Admin endpoint to list all posts with moderation options"""
    # Build query
    query = select(Post)
    
    # Filter by university (admin can only see their university's posts)
    if current_user.university_id:
        query = query.where(Post.university_id == current_user.university_id)
    elif university_id:
        query = query.where(Post.university_id == university_id)
    
    # Filter by status
    if status_filter == "active":
        query = query.where(Post.status == PostStatus.ACTIVE)
    elif status_filter == "deleted":
        query = query.where(Post.status == PostStatus.DELETED)
    elif status_filter == "hidden":
        query = query.where(Post.status == PostStatus.HIDDEN)
    
    # Search by content or author
    if search:
        from sqlalchemy.orm import aliased
        user_alias = aliased(User)
        query = query.join(user_alias, Post.author_id == user_alias.id).where(
            or_(
                Post.content.ilike(f"%{search}%"),
                user_alias.full_name.ilike(f"%{search}%"),
                user_alias.username.ilike(f"%{search}%")
            )
        )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await session.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination and ordering
    query = query.order_by(Post.is_pinned.desc(), Post.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    # Execute query
    result = await session.execute(query)
    posts = result.scalars().all()
    
    # Build response (similar to list_posts)
    post_responses = []
    for post in posts:
        likes_count = await session.scalar(
            select(func.count(Like.id)).where(Like.post_id == post.id)
        ) or 0
        
        comments_count = await session.scalar(
            select(func.count(Comment.id)).where(
                and_(Comment.post_id == post.id, Comment.status == PostStatus.ACTIVE)
            )
        ) or 0
        
        await session.refresh(post, ["author", "university"])
        
        post_responses.append(PostResponse(
            id=post.id,
            content=post.content,
            author_id=post.author_id,
            author_name=post.author.full_name or post.author.username,
            university_id=post.university_id,
            university_name=post.university.name if post.university else None,
            status=post.status.value,
            is_pinned=post.is_pinned,
            tag=post.tag.value if post.tag else None,
            company=post.company,
            likes_count=likes_count,
            comments_count=comments_count,
            user_liked=False,
            created_at=post.created_at,
            updated_at=post.updated_at,
            comments=[],
            likes=[]
        ))
    
    total_pages = (total + page_size - 1) // page_size
    
    return PostListResponse(
        posts=post_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/admin/posts/{post_id}/hide", response_model=dict)
async def hide_post(
    post_id: int,
    current_user: User = Depends(require_university_admin),
    session: AsyncSession = Depends(get_async_session)
):
    """Hide a post (admin only - soft delete)"""
    result = await session.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if admin can moderate this post (same university)
    if current_user.university_id and post.university_id != current_user.university_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only moderate posts from your university"
        )
    
    post.status = PostStatus.HIDDEN
    await session.commit()
    
    return {"message": "Post hidden successfully", "post_id": post_id}


@router.post("/admin/posts/{post_id}/restore", response_model=dict)
async def restore_post(
    post_id: int,
    current_user: User = Depends(require_university_admin),
    session: AsyncSession = Depends(get_async_session)
):
    """Restore a hidden or deleted post (admin only)"""
    result = await session.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if admin can moderate this post
    if current_user.university_id and post.university_id != current_user.university_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only moderate posts from your university"
        )
    
    post.status = PostStatus.ACTIVE
    await session.commit()
    
    return {"message": "Post restored successfully", "post_id": post_id}


@router.post("/admin/posts/{post_id}/pin", response_model=dict)
async def toggle_pin_post(
    post_id: int,
    current_user: User = Depends(require_university_admin),
    session: AsyncSession = Depends(get_async_session)
):
    """Pin or unpin a post (admin only)"""
    result = await session.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if admin can moderate this post
    if current_user.university_id and post.university_id != current_user.university_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only moderate posts from your university"
        )
    
    post.is_pinned = not post.is_pinned
    await session.commit()
    
    return {
        "message": "Post pinned" if post.is_pinned else "Post unpinned",
        "post_id": post_id,
        "is_pinned": post.is_pinned
    }

