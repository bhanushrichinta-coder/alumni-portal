#!/usr/bin/env python3
"""
Verification script to check if deployment is working correctly
"""
import requests
import json
import sys

# API base URL - change this to your Render URL
BASE_URL = "https://alumni-portal-yw7q.onrender.com"
API_URL = f"{BASE_URL}/api/v1"

# Test users
USERS = {
    "super_admin": {
        "username": "superadmin",
        "password": "superadmin123",
        "role": "SUPER_ADMIN",
        "university": None
    },
    "tech_admin": {
        "username": "tech_admin",
        "password": "admin123",
        "role": "UNIVERSITY_ADMIN",
        "university": "Tech University"
    },
    "biz_admin": {
        "username": "biz_admin",
        "password": "admin123",
        "role": "UNIVERSITY_ADMIN",
        "university": "Business University"
    },
    "tech_alumni": {
        "username": "tech_alumni",
        "password": "alumni123",
        "role": "ALUMNI",
        "university": "Tech University"
    },
    "biz_alumni": {
        "username": "biz_alumni",
        "password": "alumni123",
        "role": "ALUMNI",
        "university": "Business University"
    }
}

def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

def test_health_check():
    """Test health check endpoint"""
    print_header("1. Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False

def test_user_login(user_key, user_info, template=None):
    """Test user login"""
    username = user_info["username"]
    password = user_info["password"]
    
    payload = {"username": username, "password": password}
    if template:
        payload["website_template"] = template
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            access_token = data.get("access_token")
            received_template = data.get("website_template")
            
            print(f"✅ {user_key} login successful")
            print(f"   Username: {username}")
            print(f"   Role: {user_info['role']}")
            print(f"   University: {user_info['university'] or 'None'}")
            if template:
                print(f"   Template sent: {template}")
            print(f"   Template received: {received_template}")
            print(f"   Token: {access_token[:30]}...")
            
            return access_token, received_template
        else:
            print(f"❌ {user_key} login failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None, None
    except Exception as e:
        print(f"❌ {user_key} login error: {str(e)}")
        return None, None

def test_template_endpoint(access_token, user_key):
    """Test template endpoint"""
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(
            f"{API_URL}/auth/template",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {user_key} template endpoint works")
            print(f"   Template: {data.get('website_template')}")
            print(f"   University: {data.get('university_name')}")
            return True
        elif response.status_code == 404:
            print(f"⚠️  {user_key} not associated with university")
            return True  # Not an error if user has no university
        else:
            print(f"❌ {user_key} template endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {user_key} template endpoint error: {str(e)}")
        return False

def main():
    """Run all verification tests"""
    print_header("Deployment Verification")
    print(f"Testing API at: {BASE_URL}")
    
    results = {
        "health": False,
        "logins": {},
        "templates": {}
    }
    
    # Test 1: Health check
    results["health"] = test_health_check()
    
    if not results["health"]:
        print("\n❌ Health check failed. API might not be running.")
        sys.exit(1)
    
    # Test 2: User logins
    print_header("2. User Login Tests")
    tokens = {}
    
    for user_key, user_info in USERS.items():
        token, template = test_user_login(user_key, user_info)
        tokens[user_key] = token
        results["logins"][user_key] = token is not None
    
    # Test 3: Template endpoints
    print_header("3. Template Endpoint Tests")
    for user_key, token in tokens.items():
        if token:
            results["templates"][user_key] = test_template_endpoint(token, user_key)
    
    # Test 4: Template setting (admin only)
    print_header("4. Template Setting Tests")
    
    # Tech admin sets template
    print("\n📝 Tech Admin setting template...")
    tech_token, _ = test_user_login("tech_admin", USERS["tech_admin"], template="tech-blue")
    if tech_token:
        test_template_endpoint(tech_token, "tech_admin")
    
    # Tech alumni should receive template
    print("\n📝 Tech Alumni receiving template...")
    tech_alumni_token, received = test_user_login("tech_alumni", USERS["tech_alumni"])
    if received == "tech-blue":
        print("✅ Tech Alumni correctly received Tech University template!")
    else:
        print(f"⚠️  Tech Alumni template: {received} (expected: tech-blue)")
    
    # Business admin sets different template
    print("\n📝 Business Admin setting template...")
    biz_token, _ = test_user_login("biz_admin", USERS["biz_admin"], template="biz-green")
    if biz_token:
        test_template_endpoint(biz_token, "biz_admin")
    
    # Business alumni should receive different template
    print("\n📝 Business Alumni receiving template...")
    biz_alumni_token, received = test_user_login("biz_alumni", USERS["biz_alumni"])
    if received == "biz-green":
        print("✅ Business Alumni correctly received Business University template!")
    else:
        print(f"⚠️  Business Alumni template: {received} (expected: biz-green)")
    
    # Summary
    print_header("Summary")
    
    total_tests = 1 + len(results["logins"]) + len(results["templates"])
    passed_tests = (
        (1 if results["health"] else 0) +
        sum(1 for v in results["logins"].values() if v) +
        sum(1 for v in results["templates"].values() if v)
    )
    
    print(f"✅ Health Check: {'PASS' if results['health'] else 'FAIL'}")
    print(f"\n📊 Login Tests:")
    for user_key, passed in results["logins"].items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {status} - {user_key}")
    
    print(f"\n📊 Template Tests:")
    for user_key, passed in results["templates"].items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {status} - {user_key}")
    
    print(f"\n🎯 Overall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n🎉 All tests passed! Deployment is working correctly!")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

