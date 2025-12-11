#!/usr/bin/env python3
"""
Test login with both username and email
"""
import requests
import json
import sys

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "https://alumni-portal-yw7q.onrender.com"

def test_login(identifier_type: str, identifier: str, password: str):
    """Test login with username or email"""
    login_url = f"{BASE_URL}/api/v1/auth/login"
    
    if identifier_type == "email":
        login_data = {
            "email": identifier,
            "password": password
        }
    else:
        login_data = {
            "username": identifier,
            "password": password
        }
    
    print(f"\nTesting login with {identifier_type}: {identifier}")
    print(f"Request: {json.dumps(login_data, indent=2)}")
    
    try:
        response = requests.post(login_url, json=login_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS!")
            print(f"   Access Token: {data.get('access_token', 'N/A')[:50]}...")
            return True
        else:
            print(f"❌ FAILED: {response.text}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Testing Login with Username and Email")
    print("=" * 60)
    
    # Test with username
    test_login("username", "superadmin", "superadmin123")
    
    # Test with email
    test_login("email", "superadmin@alumni-portal.com", "superadmin123")
    
    # Test with university admin email
    test_login("email", "admin1@tech.edu", "admin123")

