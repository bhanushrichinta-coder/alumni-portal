#!/usr/bin/env python3
"""
Test script to verify super admin login
"""
import requests
import json
import sys

# Get base URL from command line or use default
BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "https://alumni-portal-yw7q.onrender.com"

def test_super_admin_login():
    """Test super admin login"""
    print(f"Testing super admin login at {BASE_URL}")
    print("=" * 60)
    
    # Test login
    login_url = f"{BASE_URL}/api/v1/auth/login"
    login_data = {
        "username": "superadmin",
        "password": "superadmin123"
    }
    
    print(f"\n1. Testing POST {login_url}")
    print(f"   Request body: {json.dumps(login_data, indent=2)}")
    
    try:
        response = requests.post(login_url, json=login_data, timeout=10)
        print(f"\n   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ SUCCESS: Login successful!")
            data = response.json()
            print(f"\n   Response:")
            print(f"   - Access Token: {data.get('access_token', 'N/A')[:50]}...")
            print(f"   - Token Type: {data.get('token_type', 'N/A')}")
            print(f"   - Website Template: {data.get('website_template', 'None')}")
            
            # Test /me endpoint with the token
            access_token = data.get('access_token')
            if access_token:
                print(f"\n2. Testing GET {BASE_URL}/api/v1/auth/me")
                headers = {"Authorization": f"Bearer {access_token}"}
                me_response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers, timeout=10)
                print(f"   Status Code: {me_response.status_code}")
                
                if me_response.status_code == 200:
                    user_data = me_response.json()
                    print("   ✅ SUCCESS: User info retrieved!")
                    print(f"\n   User Info:")
                    print(f"   - Username: {user_data.get('username', 'N/A')}")
                    print(f"   - Email: {user_data.get('email', 'N/A')}")
                    print(f"   - Role: {user_data.get('role', 'N/A')}")
                    print(f"   - University ID: {user_data.get('university_id', 'None')}")
                    print(f"   - Is Active: {user_data.get('is_active', 'N/A')}")
                else:
                    print(f"   ❌ FAILED: {me_response.text}")
            
            return True
        else:
            print(f"   ❌ FAILED: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_super_admin_login()
    sys.exit(0 if success else 1)

