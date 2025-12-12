# Fix CORS for Localhost

## Issue
CORS error when accessing API from `http://localhost:8080`:
```
Access to fetch at 'https://alumni-portal-yw7q.onrender.com/api/v1/auth/login' 
from origin 'http://localhost:8080' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

### Option 1: Update Render Environment Variable (Recommended)

1. Go to Render Dashboard → Your Service → Environment
2. Find `CORS_ORIGINS` variable
3. Set it to: `*` (wildcard to allow all origins)
4. Or set it to: `http://localhost:8080` (specific origin)
5. Save and redeploy

### Option 2: Update render.yaml

The `render.yaml` already has:
```yaml
- key: CORS_ORIGINS
  value: "*"
```

Make sure this is deployed.

### Option 3: Add localhost explicitly

If you want to allow both localhost and production:
1. In Render Dashboard, set `CORS_ORIGINS` to: `http://localhost:8080,https://your-frontend-domain.com`
2. Or update `render.yaml`:
```yaml
- key: CORS_ORIGINS
  value: "http://localhost:8080,https://your-frontend-domain.com"
```

## Code Changes Made

Updated `app/main.py` to:
- Explicitly allow OPTIONS method (for preflight requests)
- Add `expose_headers` for better CORS support
- Better handling of wildcard origins

## After Fix

1. **Push the code changes:**
   ```bash
   git add app/main.py
   git commit -m "Fix CORS configuration for localhost"
   git push personal dev
   git push origin dev
   ```

2. **Update Render environment variable:**
   - Go to Render Dashboard
   - Set `CORS_ORIGINS` to `*` or `http://localhost:8080`
   - Redeploy

3. **Test:**
   - Try the request from `http://localhost:8080` again
   - Should work now!

## Current Configuration

- **Default:** Allows all origins (`*`)
- **Render:** Should have `CORS_ORIGINS=*` set
- **Methods:** GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Headers:** All headers allowed

