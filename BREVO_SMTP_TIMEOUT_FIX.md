# Brevo SMTP Timeout Fix

## Problem
Render is blocking outbound SMTP connections on port 587, causing timeouts:
```
Network error sending email: timed out
SMTP Host: smtp-relay.brevo.com, Port: 587
```

## Solutions

### Solution 1: Use Port 465 with SSL (Recommended)

Brevo supports port 465 with SSL. Update your Render environment variables:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=465
SMTP_USER=9e08ea001@smtp-brevo.com
SMTP_PASSWORD=8EDP4SJvRWCL5glx
SMTP_FROM_EMAIL=noreply@alumni-portal.com
```

**Steps:**
1. Go to Render Dashboard → Your service → Environment
2. Update `SMTP_PORT` from `587` to `465`
3. Save and redeploy
4. Test again

### Solution 2: Try Port 2525 (Alternative)

Some cloud platforms allow port 2525:

```env
SMTP_PORT=2525
```

### Solution 3: Use Brevo API (Most Reliable)

For cloud platforms, using Brevo's API is more reliable than SMTP. This requires code changes to use HTTP API instead of SMTP.

## Code Changes Made

✅ **Updated email service** to support:
- Port 465 with SSL (SMTP_SSL)
- Port 587 with STARTTLS (existing)
- Increased timeout from 10s to 30s
- Better error handling

## Testing After Fix

1. Update `SMTP_PORT` to `465` in Render
2. Wait for redeploy
3. Create a new user
4. Check logs for "Email sent successfully"

## Why This Happens

Cloud platforms like Render often block outbound SMTP connections on certain ports to prevent spam. Port 465 (SSL) is sometimes less restricted than port 587 (STARTTLS).

## Next Steps

1. **Try Port 465 first** (easiest fix)
2. If that doesn't work, consider using Brevo API
3. Check Render documentation for allowed outbound ports

