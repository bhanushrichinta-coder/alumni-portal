#!/usr/bin/env python3
"""
Comprehensive test for first-time and consecutive logins for all user types
"""
import requests
import json
import sys
import time

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "https://alumni-portal-yw7q.onrender.com"

# Test users from init_db.py
TEST_USERS = [
    {
        "name": "Super Admin",
        "username": "superadmin",
        "email": "superadmin@alumni-portal.com",
        "password": "superadmin123",
        "role": "SUPER_ADMIN",
        "has_university": False
    },
    {
        "name": "Tech University Admin",
        "username": "tech_admin",
        "email": "admin1@tech.edu",
        "password": "admin123",
        "role": "UNIVERSITY_ADMIN",
        "has_university": True
    },
    {
        "name": "Business University Admin",
        "username": "biz_admin",
        "email": "admin2@biz.edu",
        "password": "admin123",
        "role": "UNIVERSITY_ADMIN",
        "has_university": True
    },
    {
        "name": "Tech Alumni",
        "username": "tech_alumni",
        "email": "alumni1@tech.edu",
        "password": "alumni123",
        "role": "ALUMNI",
        "has_university": True
    },
    {
        "name": "Business Alumni",
        "username": "biz_alumni",
        "email": "alumni2@biz.edu",
        "password": "alumni123",
        "role": "ALUMNI",
        "has_university": True
    }
]

def test_login(username=None, email=None, password=None, identifier_type="username"):
    """Test login with username or email"""
    login_url = f"{BASE_URL}/api/v1/auth/login"
    
    if email:
        login_data = {"email": email, "password": password}
        identifier = email
    else:
        login_data = {"username": username, "password": password}
        identifier = username
    
    try:
        response = requests.post(login_url, json=login_data, timeout=15)
        return response.status_code == 200, response.json() if response.status_code == 200 else response.text, identifier
    except Exception as e:
        return False, str(e), identifier

def test_get_me(access_token):
    """Test /auth/me endpoint"""
    me_url = f"{BASE_URL}/api/v1/auth/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    try:
        response = requests.get(me_url, headers=headers, timeout=10)
        return response.status_code == 200, response.json() if response.status_code == 200 else response.text
    except Exception as e:
        return False, str(e)

def test_user(user_info, test_name):
    """Test login for a specific user"""
    print(f"\n{'='*70}")
    print(f"TEST: {test_name} - {user_info['name']}")
    print(f"{'='*70}")
    
    results = {
        "first_login_username": None,
        "first_login_email": None,
        "consecutive_login_username": None,
        "consecutive_login_email": None,
        "me_endpoint": None
    }
    
    # Test 1: First-time login with username
    print(f"\n1. First-time login with USERNAME: {user_info['username']}")
    success, data, identifier = test_login(username=user_info['username'], password=user_info['password'])
    if success:
        print(f"   ✅ SUCCESS")
        print(f"   - Access Token: {data.get('access_token', 'N/A')[:50]}...")
        print(f"   - Token Type: {data.get('token_type', 'N/A')}")
        print(f"   - Website Template: {data.get('website_template', 'None')}")
        results["first_login_username"] = {"success": True, "token": data.get('access_token')}
        
        # Test /me endpoint with first token
        print(f"\n   Testing /auth/me with first token...")
        me_success, me_data = test_get_me(data.get('access_token'))
        if me_success:
            print(f"   ✅ /auth/me SUCCESS")
            print(f"   - Username: {me_data.get('username', 'N/A')}")
            print(f"   - Email: {me_data.get('email', 'N/A')}")
            print(f"   - Role: {me_data.get('role', 'N/A')}")
            print(f"   - University ID: {me_data.get('university_id', 'None')}")
            results["me_endpoint"] = {"success": True, "data": me_data}
        else:
            print(f"   ❌ /auth/me FAILED: {me_data}")
            results["me_endpoint"] = {"success": False, "error": me_data}
    else:
        print(f"   ❌ FAILED: {data}")
        results["first_login_username"] = {"success": False, "error": data}
    
    # Wait a moment between requests
    time.sleep(1)
    
    # Test 2: First-time login with email
    print(f"\n2. First-time login with EMAIL: {user_info['email']}")
    success, data, identifier = test_login(email=user_info['email'], password=user_info['password'])
    if success:
        print(f"   ✅ SUCCESS")
        print(f"   - Access Token: {data.get('access_token', 'N/A')[:50]}...")
        print(f"   - Token Type: {data.get('token_type', 'N/A')}")
        print(f"   - Website Template: {data.get('website_template', 'None')}")
        results["first_login_email"] = {"success": True, "token": data.get('access_token')}
    else:
        print(f"   ❌ FAILED: {data}")
        results["first_login_email"] = {"success": False, "error": data}
    
    # Wait a moment between requests
    time.sleep(1)
    
    # Test 3: Consecutive login with username (second login)
    print(f"\n3. Consecutive login with USERNAME: {user_info['username']} (2nd attempt)")
    success, data, identifier = test_login(username=user_info['username'], password=user_info['password'])
    if success:
        print(f"   ✅ SUCCESS")
        print(f"   - Access Token: {data.get('access_token', 'N/A')[:50]}...")
        print(f"   - New token generated: {data.get('access_token') != results.get('first_login_username', {}).get('token')}")
        results["consecutive_login_username"] = {"success": True, "token": data.get('access_token')}
    else:
        print(f"   ❌ FAILED: {data}")
        results["consecutive_login_username"] = {"success": False, "error": data}
    
    # Wait a moment between requests
    time.sleep(1)
    
    # Test 4: Consecutive login with email (second login)
    print(f"\n4. Consecutive login with EMAIL: {user_info['email']} (2nd attempt)")
    success, data, identifier = test_login(email=user_info['email'], password=user_info['password'])
    if success:
        print(f"   ✅ SUCCESS")
        print(f"   - Access Token: {data.get('access_token', 'N/A')[:50]}...")
        print(f"   - New token generated: {data.get('access_token') != results.get('first_login_email', {}).get('token')}")
        results["consecutive_login_email"] = {"success": True, "token": data.get('access_token')}
    else:
        print(f"   ❌ FAILED: {data}")
        results["consecutive_login_email"] = {"success": False, "error": data}
    
    return results

def main():
    """Run all login tests"""
    print("="*70)
    print("COMPREHENSIVE LOGIN TEST - First-time and Consecutive Logins")
    print("="*70)
    print(f"Testing against: {BASE_URL}")
    print(f"Total users to test: {len(TEST_USERS)}")
    
    all_results = {}
    summary = {
        "total_users": len(TEST_USERS),
        "passed": 0,
        "failed": 0,
        "details": {}
    }
    
    for user in TEST_USERS:
        results = test_user(user, f"User: {user['name']}")
        all_results[user['name']] = results
        
        # Check if all tests passed
        all_passed = all([
            results.get("first_login_username", {}).get("success"),
            results.get("first_login_email", {}).get("success"),
            results.get("consecutive_login_username", {}).get("success"),
            results.get("consecutive_login_email", {}).get("success"),
            results.get("me_endpoint", {}).get("success")
        ])
        
        if all_passed:
            summary["passed"] += 1
        else:
            summary["failed"] += 1
        
        summary["details"][user['name']] = {
            "all_passed": all_passed,
            "role": user['role'],
            "has_university": user['has_university']
        }
    
    # Print summary
    print(f"\n\n{'='*70}")
    print("TEST SUMMARY")
    print(f"{'='*70}")
    print(f"Total Users Tested: {summary['total_users']}")
    print(f"✅ All Tests Passed: {summary['passed']}")
    print(f"❌ Failed: {summary['failed']}")
    print(f"\nDetailed Results:")
    for user_name, details in summary["details"].items():
        status = "✅ PASS" if details["all_passed"] else "❌ FAIL"
        print(f"  {status} - {user_name} ({details['role']})")
    
    return summary["failed"] == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

