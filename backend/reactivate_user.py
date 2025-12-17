"""
Script to reactivate a deactivated user
Usage: python reactivate_user.py <email>
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User

def reactivate_user(email: str):
    """Reactivate a user by email"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User with email {email} not found")
            return False
        
        if user.is_active:
            print(f"User {email} is already active")
            return True
        
        user.is_active = True
        db.commit()
        print(f"✅ User {email} has been reactivated")
        return True
    except Exception as e:
        print(f"❌ Error reactivating user: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python reactivate_user.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    reactivate_user(email)

