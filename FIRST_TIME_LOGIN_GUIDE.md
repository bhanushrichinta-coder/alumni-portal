# First-Time Login Handling

## Overview

The authentication system now detects and handles first-time logins.

## How It Works

### Detection
- **First-time login** is detected when `user.last_login` is `None`
- After first login, `last_login` is updated with the current timestamp
- Subsequent logins will have `is_first_login: false`

### Login Response

When a user logs in, the response includes an `is_first_login` flag:

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "website_template": "template1",
  "is_first_login": true  // or false
}
```

## Frontend Implementation

### Check First-Time Login

```javascript
// After login
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const data = await response.json();

if (data.is_first_login) {
  // Show welcome message
  // Redirect to onboarding/tutorial
  // Show profile setup
  // etc.
} else {
  // Normal login flow
  // Redirect to dashboard
}
```

### Example Use Cases

1. **Welcome Message:**
   ```javascript
   if (data.is_first_login) {
     showWelcomeModal();
   }
   ```

2. **Onboarding Flow:**
   ```javascript
   if (data.is_first_login) {
     router.push('/onboarding');
   } else {
     router.push('/dashboard');
   }
   ```

3. **Profile Setup:**
   ```javascript
   if (data.is_first_login) {
     // Prompt user to complete profile
     showProfileSetup();
   }
   ```

## Database Updates

### `last_login` Field
- Updated automatically on every login
- Format: ISO 8601 timestamp string
- Example: `"2025-12-11T10:00:00.000000"`

### Tracking
- First login: `last_login` is `None` → `is_first_login: true`
- Subsequent logins: `last_login` has value → `is_first_login: false`

## API Endpoint

**POST** `/api/v1/auth/login`

**Request:**
```json
{
  "username": "user123",
  "password": "password123"
}
```

**Response (First-Time):**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "website_template": "template1",
  "is_first_login": true
}
```

**Response (Subsequent):**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "website_template": "template1",
  "is_first_login": false
}
```

## Summary

- ✅ First-time login detection implemented
- ✅ `last_login` timestamp updated on every login
- ✅ `is_first_login` flag in login response
- ✅ Frontend can show welcome/onboarding for first-time users

