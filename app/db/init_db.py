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
        # Create MIT University
        mit_university = db.query(University).filter(University.name == "MIT").first()
        if not mit_university:
            mit_university = University(
                name="MIT",
                code="MIT",
                description="Massachusetts Institute of Technology",
                location="Cambridge, MA"
            )
            db.add(mit_university)
            db.commit()
            db.refresh(mit_university)
            logger.info("Created university: MIT")
        
        # Create Stanford University
        stanford_university = db.query(University).filter(University.name == "Stanford").first()
        if not stanford_university:
            stanford_university = University(
                name="Stanford",
                code="STANFORD",
                description="Stanford University",
                location="Stanford, CA"
            )
            db.add(stanford_university)
            db.commit()
            db.refresh(stanford_university)
            logger.info("Created university: Stanford")
        
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

        # Create MIT University Admin
        mit_admin = db.query(User).filter(User.email == "admin@mit.edu").first()
        if not mit_admin:
            mit_admin = User(
                email="admin@mit.edu",
                username="mit_admin",
                hashed_password=get_password_hash("mit123"),
                full_name="MIT University Admin",
                role=UserRole.UNIVERSITY_ADMIN,
                is_active=True,
                is_verified=True,
                university_id=mit_university.id
            )
            db.add(mit_admin)
            db.commit()
            logger.info("Created MIT university admin: admin@mit.edu / mit123")

        # Create Stanford University Admin
        stanford_admin = db.query(User).filter(User.email == "admin@stanford.edu").first()
        if not stanford_admin:
            stanford_admin = User(
                email="admin@stanford.edu",
                username="stanford_admin",
                hashed_password=get_password_hash("stanford123"),
                full_name="Stanford University Admin",
                role=UserRole.UNIVERSITY_ADMIN,
                is_active=True,
                is_verified=True,
                university_id=stanford_university.id
            )
            db.add(stanford_admin)
            db.commit()
            logger.info("Created Stanford university admin: admin@stanford.edu / stanford123")

        # Create MIT Alumni - John Doe
        mit_alumni1 = db.query(User).filter(User.email == "john.doe@mit.edu").first()
        if not mit_alumni1:
            mit_alumni1 = User(
                email="john.doe@mit.edu",
                username="john_doe_mit",
                hashed_password=get_password_hash("mit123"),
                full_name="John Doe",
                role=UserRole.ALUMNI,
                is_active=True,
                is_verified=True,
                university_id=mit_university.id
            )
            db.add(mit_alumni1)
            db.commit()
            logger.info("Created MIT alumni: john.doe@mit.edu / mit123")

        # Create Stanford Alumni - Michael Smith
        stanford_alumni1 = db.query(User).filter(User.email == "michael.smith@stanford.edu").first()
        if not stanford_alumni1:
            stanford_alumni1 = User(
                email="michael.smith@stanford.edu",
                username="michael_smith_stanford",
                hashed_password=get_password_hash("stanford123"),
                full_name="Michael Smith",
                role=UserRole.ALUMNI,
                is_active=True,
                is_verified=True,
                university_id=stanford_university.id
            )
            db.add(stanford_alumni1)
            db.commit()
            logger.info("Created Stanford alumni: michael.smith@stanford.edu / stanford123")

        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()


