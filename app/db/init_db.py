"""
Database initialization script
"""
import asyncio
from sqlalchemy import text
from app.db.session import sync_engine, SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.university import University
from app.core.logging import logger


def init_db():
    """Initialize database with seed data"""
    db = SessionLocal()
    try:
        # Create University 1
        university1 = db.query(University).filter(University.name == "Tech University").first()
        if not university1:
            university1 = University(
                name="Tech University",
                code="TECH",
                description="Leading technology and engineering university",
                location="San Francisco, CA"
            )
            db.add(university1)
            db.commit()
            db.refresh(university1)
            logger.info("Created university: Tech University")
        
        # Create University 2
        university2 = db.query(University).filter(University.name == "Business University").first()
        if not university2:
            university2 = University(
                name="Business University",
                code="BIZ",
                description="Premier business and management university",
                location="New York, NY"
            )
            db.add(university2)
            db.commit()
            db.refresh(university2)
            logger.info("Created university: Business University")
        
        # Create Super Admin (no university association)
        super_admin = db.query(User).filter(User.email == "superadmin@alumni-portal.com").first()
        if not super_admin:
            super_admin = User(
                email="superadmin@alumni-portal.com",
                username="superadmin",
                hashed_password=get_password_hash("superadmin123"),
                full_name="Super Administrator",
                role=UserRole.SUPER_ADMIN,
                is_active=True,
                is_verified=True
            )
            db.add(super_admin)
            db.commit()
            logger.info("Created super admin user: superadmin@alumni-portal.com / superadmin123")

        # Create University Admin 1 (Tech University)
        admin1 = db.query(User).filter(User.email == "admin1@tech.edu").first()
        if not admin1:
            admin1 = User(
                email="admin1@tech.edu",
                username="tech_admin",
                hashed_password=get_password_hash("admin123"),
                full_name="Tech University Admin",
                role=UserRole.UNIVERSITY_ADMIN,
                is_active=True,
                is_verified=True,
                university_id=university1.id
            )
            db.add(admin1)
            db.commit()
            logger.info("Created university admin 1: admin1@tech.edu / admin123 (Tech University)")

        # Create University Admin 2 (Business University)
        admin2 = db.query(User).filter(User.email == "admin2@biz.edu").first()
        if not admin2:
            admin2 = User(
                email="admin2@biz.edu",
                username="biz_admin",
                hashed_password=get_password_hash("admin123"),
                full_name="Business University Admin",
                role=UserRole.UNIVERSITY_ADMIN,
                is_active=True,
                is_verified=True,
                university_id=university2.id
            )
            db.add(admin2)
            db.commit()
            logger.info("Created university admin 2: admin2@biz.edu / admin123 (Business University)")

        # Create Alumni 1 (Tech University)
        alumni1 = db.query(User).filter(User.email == "alumni1@tech.edu").first()
        if not alumni1:
            alumni1 = User(
                email="alumni1@tech.edu",
                username="tech_alumni",
                hashed_password=get_password_hash("alumni123"),
                full_name="Tech Alumni User",
                role=UserRole.ALUMNI,
                is_active=True,
                is_verified=True,
                university_id=university1.id
            )
            db.add(alumni1)
            db.commit()
            logger.info("Created alumni 1: alumni1@tech.edu / alumni123 (Tech University)")

        # Create Alumni 2 (Business University)
        alumni2 = db.query(User).filter(User.email == "alumni2@biz.edu").first()
        if not alumni2:
            alumni2 = User(
                email="alumni2@biz.edu",
                username="biz_alumni",
                hashed_password=get_password_hash("alumni123"),
                full_name="Business Alumni User",
                role=UserRole.ALUMNI,
                is_active=True,
                is_verified=True,
                university_id=university2.id
            )
            db.add(alumni2)
            db.commit()
            logger.info("Created alumni 2: alumni2@biz.edu / alumni123 (Business University)")

        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()


