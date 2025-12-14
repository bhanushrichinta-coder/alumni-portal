# Deployment Branch Configuration

## Branch Setup

- **Backend (Render)**: Deploys from `temp_backend` branch
- **Frontend (Vercel)**: Deploys from `main` branch

## Important Notes

### When Pushing Changes:

1. **For Backend Changes:**
   ```bash
   git push personal main:temp_backend
   ```
   - This pushes `main` branch to `temp_backend` on GitHub
   - Render will auto-detect and deploy

2. **For Frontend Changes:**
   ```bash
   git push personal main:main
   ```
   - This pushes to `main` branch
   - Vercel will auto-detect and deploy

3. **For Both:**
   ```bash
   git push personal main:main
   git push personal main:temp_backend
   ```

### Current Status

✅ **Username fix pushed to:**
- `main` branch (for frontend)
- `temp_backend` branch (for backend/Render)

### Render Deployment

- **Branch**: `temp_backend`
- **Auto-deploy**: Enabled (should deploy automatically)
- **Manual deploy**: Available in Render dashboard

### Vercel Deployment

- **Branch**: `main`
- **Auto-deploy**: Enabled
- **Manual deploy**: Available in Vercel dashboard

## Quick Commands

```bash
# Push to both branches
git push personal main:main
git push personal main:temp_backend

# Check what's different
git log temp_backend..main --oneline

# See all branches
git branch -a
```

## Current Fixes Pushed

✅ Username column fix
✅ Email service improvements
✅ User activation endpoint
✅ All recent changes

Both branches are now in sync!

