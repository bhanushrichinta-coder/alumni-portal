# Running Database Migrations on Render

## ✅ Automatic Migrations (Recommended)

Your `render.yaml` is configured to run migrations automatically before each deployment using the `preDeployCommand`.

**What happens:**
- Every time Render deploys, it runs `alembic upgrade head` before starting the app
- This ensures your database is always up to date

## 🔧 Manual Migration (If Needed)

If you need to run migrations manually on Render:

### Option 1: Using Render Shell (Easiest)

1. Go to your Render dashboard: https://dashboard.render.com
2. Open your web service
3. Click on the **"Shell"** tab (or terminal icon)
4. Run these commands:

```bash
# Run migrations
alembic upgrade head

# Initialize database with seed data (only needed once)
python -m app.db.init_db
```

### Option 2: Using Render CLI

1. Install Render CLI:
   ```bash
   npm install -g render-cli
   ```

2. Login:
   ```bash
   render login
   ```

3. Run migrations:
   ```bash
   render exec <service-id> -- alembic upgrade head
   ```

## 📋 Migration Checklist

- [x] ✅ Migrations run automatically on deploy (via `preDeployCommand`)
- [ ] Run `python -m app.db.init_db` once to create default university and users
- [ ] Verify migrations: Check Render logs for "Running migrations..." messages

## 🎯 Current Migrations

Your database includes these migrations:
1. `001_initial_migration.py` - Initial tables
2. `002_update_user_roles.py` - Updated user roles
3. `392f9b11e32f_add_website_template_to_users.py` - Added website_template (deprecated, moved to University)
4. `2b88741310f6_add_university_model_and_associate_with_.py` - **University model and template system**

## ⚠️ Important Notes

- **First Deployment**: After first deploy, run `python -m app.db.init_db` to create:
  - Default University
  - Super Admin user
  - University Admin user (associated with university)
  - Alumni user (associated with university)

- **Subsequent Deployments**: Migrations run automatically, but `init_db` only creates users if they don't exist

## 🔍 Verify Migrations

Check if migrations ran successfully:

1. **Check Render Logs:**
   - Look for: "Running migrations..." or "alembic upgrade head"
   - Should see: "INFO [alembic.runtime.migration] Running upgrade..."

2. **Check Database:**
   - Connect to your Neon database
   - Verify `universities` table exists
   - Verify `users.university_id` column exists

3. **Test API:**
   - Visit: https://alumni-portal-yw7q.onrender.com/docs
   - Try the `/api/v1/auth/template` endpoints

