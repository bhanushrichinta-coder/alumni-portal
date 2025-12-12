# Fix CORS Error on Render

## Problem
Frontend developer is getting CORS errors when trying to access the API from Render domain.

## Solution

The CORS configuration has been updated to allow all origins by default. You need to set the `CORS_ORIGINS` environment variable in Render.

## Steps to Fix in Render Dashboard

### Option 1: Allow All Origins (Quick Fix - Development)

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `alumni-portal-api` service
3. Go to **Environment** tab
4. Find or add the environment variable:
   - **Key**: `CORS_ORIGINS`
   - **Value**: `*`
5. Click **Save Changes**
6. Render will automatically redeploy

### Option 2: Allow Specific Frontend Domain (Recommended for Production)

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `alumni-portal-api` service
3. Go to **Environment** tab
4. Find or add the environment variable:
   - **Key**: `CORS_ORIGINS`
   - **Value**: `https://your-frontend-domain.com,http://localhost:3000,http://localhost:5173`
   
   **Example:**
   ```
   https://my-frontend.vercel.app,http://localhost:3000,http://localhost:5173
   ```
   
   **Note:** Separate multiple origins with commas (no spaces)
5. Click **Save Changes**
6. Render will automatically redeploy

## Current Configuration

The code has been updated to:
- Default to `*` (allow all origins) if not specified
- Support both wildcard (`*`) and specific origins
- Automatically disable credentials when using wildcard (security requirement)

## Testing

After updating the environment variable:

1. Wait for Render to redeploy (usually 1-2 minutes)
2. Test from your frontend:
   ```javascript
   fetch('https://alumni-portal-yw7q.onrender.com/api/v1/health')
     .then(res => res.json())
     .then(data => console.log(data))
   ```

3. Check browser console - CORS errors should be gone

## Important Notes

- **Wildcard (`*`)**: Works for development but cannot use credentials (cookies/auth headers)
- **Specific Origins**: Required for production with authentication
- **Multiple Origins**: Separate with commas: `origin1,origin2,origin3`
- **No Spaces**: Don't add spaces between origins in the comma-separated list

## If Still Getting Errors

1. **Check the exact error message** in browser console
2. **Verify the frontend URL** matches exactly what's in `CORS_ORIGINS`
3. **Check Render logs** for any startup errors
4. **Ensure the service redeployed** after changing environment variables

## Example Frontend URLs to Add

Common frontend hosting platforms:
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`
- GitHub Pages: `https://username.github.io`
- Custom domain: `https://yourdomain.com`

Add all the URLs your frontend might be accessed from.

