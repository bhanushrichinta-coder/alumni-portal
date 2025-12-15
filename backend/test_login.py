#!/usr/bin/env python3
"""
Test login endpoint to debug authentication issues
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash

def test_password():
    """Test password hashing and verification"""
    password = "password123"
    print(f"Testing password: {password}")
    
    # Hash password
    hashed = get_password_hash(password)
    print(f"Hashed: {hashed[:50]}...")
    
    # Verify password
    is_valid = verify_password(password, hashed)
    print(f"Verification: {'✅ PASS' if is_valid else '❌ FAIL'}")
    
    return is_valid

def check_user_in_db():
    """Check if user exists and password hash"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "john.doe@alumni.mit.edu").first()
        if user:
            print(f"\n✅ User found: {user.email}")
            print(f"   Name: {user.name}")
            print(f"   Role: {user.role.value}")
            print(f"   Active: {user.is_active}")
            print(f"   Hashed password: {user.hashed_password[:50]}...")
            
            # Test password verification
            is_valid = verify_password("password123", user.hashed_password)
            print(f"   Password verification: {'✅ PASS' if is_valid else '❌ FAIL'}")
            
            if not is_valid:
                print("\n⚠️  Password hash mismatch!")
                print("   The password in database doesn't match 'password123'")
                print("   This might mean:")
                print("   1. Password was hashed with different method")
                print("   2. Database has old/corrupted hash")
                print("   3. Need to re-seed database")
        else:
            print("\n❌ User not found in database")
            print("   Database needs to be seeded!")
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Login Debug Test")
    print("=" * 60)
    
    print("\n1. Testing password hashing/verification:")
    test_password()
    
    print("\n2. Checking user in database:")
    check_user_in_db()
    
    print("\n" + "=" * 60)

