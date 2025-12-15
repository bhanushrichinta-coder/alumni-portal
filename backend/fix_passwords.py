#!/usr/bin/env python3
"""
Fix password hashes in database - re-hash all passwords with correct method
Run this if login is failing due to password hash mismatch
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash, verify_password

def fix_all_passwords():
    """Re-hash all user passwords with correct method"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users in database")
        
        fixed_count = 0
        for user in users:
            # Re-hash password with correct method
            new_hash = get_password_hash("password123")
            user.hashed_password = new_hash
            fixed_count += 1
            print(f"✓ Fixed password for: {user.email}")
        
        db.commit()
        print(f"\n✅ Fixed {fixed_count} user passwords")
        print("\nAll users now have password: 'password123'")
        
        # Test verification
        print("\nTesting password verification...")
        test_user = db.query(User).filter(User.email == "john.doe@alumni.mit.edu").first()
        if test_user:
            is_valid = verify_password("password123", test_user.hashed_password)
            print(f"Test verification: {'✅ PASS' if is_valid else '❌ FAIL'}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Fix Password Hashes")
    print("=" * 60)
    print("\nThis will re-hash all passwords to 'password123'")
    print("Press Ctrl+C to cancel, or Enter to continue...")
    try:
        input()
    except KeyboardInterrupt:
        print("\nCancelled.")
        sys.exit(0)
    
    fix_all_passwords()
    print("\n" + "=" * 60)

