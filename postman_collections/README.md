# Postman Collections for Alumni Portal API

This directory contains separate Postman collections for each API module.

## Collections

1. **01_Authentication_API.postman_collection.json** - Login, register, token management, template settings
2. **02_Feed_API.postman_collection.json** - Posts, comments, and likes (with filters: tags, company, university)
3. **03_Admin_Feed_Management.postman_collection.json** - Admin moderation endpoints
4. **04_Users_API.postman_collection.json** - User management (Admin only)
5. **05_Alumni_API.postman_collection.json** - Alumni profile management
6. **06_Events_API.postman_collection.json** - Event management
7. **08_Documents_API.postman_collection.json** - Document upload and search
8. **09_Chat_API.postman_collection.json** - AI-powered chat

**Note:** Jobs functionality is now part of Posts (use tags and company filters)

## Setup Instructions

### 1. Import Collections
- Open Postman
- Click "Import" button
- Select all collection files from this directory
- All collections will be imported

### 2. Set Up Environment Variables

Create a new environment in Postman with these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `https://alumni-portal-yw7q.onrender.com` | `https://alumni-portal-yw7q.onrender.com` |
| `access_token` | (empty) | (auto-filled after login) |
| `refresh_token` | (empty) | (auto-filled after login) |
| `token_type` | (empty) | (auto-filled after login) |

### 3. Auto Token Management

The **Login** and **Login with Email** requests in the Authentication collection automatically save tokens to environment variables. After running a login request:
- `access_token` will be saved
- `refresh_token` will be saved
- `token_type` will be saved

All other requests will automatically use the `access_token` from the environment.

### 4. Test Credentials

**Super Admin:**
- Username: `superadmin`
- Email: `superadmin@alumni-portal.com`
- Password: `superadmin123`

**Tech University Admin:**
- Username: `tech_admin`
- Email: `admin1@tech.edu`
- Password: `admin123`

**Business University Admin:**
- Username: `biz_admin`
- Email: `admin2@biz.edu`
- Password: `admin123`

**Tech Alumni:**
- Username: `tech_alumni`
- Email: `alumni1@tech.edu`
- Password: `alumni123`

**Business Alumni:**
- Username: `biz_alumni`
- Email: `alumni2@biz.edu`
- Password: `alumni123`

## Usage

1. **Start with Authentication:**
   - Run "Login" or "Login with Email" from the Authentication collection
   - Tokens will be automatically saved

2. **Use Other Collections:**
   - All requests in other collections will automatically use the saved `access_token`
   - No need to manually add Authorization headers

3. **Refresh Token:**
   - When access token expires (401 error), use "Refresh Token" request
   - New tokens will be automatically saved

## Notes

- All collections use the same `base_url` variable
- Bearer token authentication is pre-configured for protected endpoints
- Public endpoints have authentication disabled (but can be enabled if needed)
- Query parameters are pre-filled but can be modified as needed

