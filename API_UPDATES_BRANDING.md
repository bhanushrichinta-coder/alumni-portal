# API Updates - University Branding Feature

## 🆕 New Endpoints

### 1. Get University Branding
**Endpoint:** `GET /api/v1/auth/branding`  
**Access:** Authenticated users (any role)  
**Description:** Get branding information for the user's university

**Request:**
```http
GET /api/v1/auth/branding
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "university_name": "MIT",
  "university_id": 1,
  "branding": {
    "logo_url": "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=200&h=200&fit=crop",
    "light_primary_color": "#B1810B",
    "light_secondary_color": "#2E2D29",
    "light_accent_color": "#E6A82D",
    "dark_primary_color": "#FFD700",
    "dark_secondary_color": "#5F574F",
    "dark_accent_color": "#FFA500"
  }
}
```

**Error Responses:**
- `404 Not Found`: User is not associated with a university

---

### 2. Update University Branding
**Endpoint:** `PUT /api/v1/auth/branding`  
**Access:** Admin only (University Admin or Super Admin)  
**Description:** Update branding information for the admin's university

**Request:**
```http
PUT /api/v1/auth/branding
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "logo_url": "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=200&h=200&fit=crop",
  "light_primary_color": "#B1810B",
  "light_secondary_color": "#2E2D29",
  "light_accent_color": "#E6A82D",
  "dark_primary_color": "#FFD700",
  "dark_secondary_color": "#5F574F",
  "dark_accent_color": "#FFA500"
}
```

**Request Body Fields (all optional):**
- `logo_url` (string, max 512 chars): University logo URL
- `light_primary_color` (string, hex format): Light mode primary color (e.g., "#B1810B")
- `light_secondary_color` (string, hex format): Light mode secondary color (e.g., "#2E2D29")
- `light_accent_color` (string, hex format): Light mode accent color (e.g., "#E6A82D")
- `dark_primary_color` (string, hex format): Dark mode primary color (e.g., "#FFD700")
- `dark_secondary_color` (string, hex format): Dark mode secondary color (e.g., "#5F574F")
- `dark_accent_color` (string, hex format): Dark mode accent color (e.g., "#FFA500")

**Response (200 OK):**
```json
{
  "message": "University branding updated successfully",
  "university_name": "MIT",
  "branding": {
    "logo_url": "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=200&h=200&fit=crop",
    "light_primary_color": "#B1810B",
    "light_secondary_color": "#2E2D29",
    "light_accent_color": "#E6A82D",
    "dark_primary_color": "#FFD700",
    "dark_secondary_color": "#5F574F",
    "dark_accent_color": "#FFA500"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid color format (must be hex like "#B1810B")
- `403 Forbidden`: Only admins can update branding
- `404 Not Found`: Admin is not associated with a university

---

## 🔄 Modified Endpoints

### Login Response Updated
**Endpoint:** `POST /api/v1/auth/login`  
**Change:** Response now includes `branding` field

**Updated Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "website_template": "template1",
  "is_first_login": false,
  "branding": {
    "logo_url": "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=200&h=200&fit=crop",
    "light_primary_color": "#B1810B",
    "light_secondary_color": "#2E2D29",
    "light_accent_color": "#E6A82D",
    "dark_primary_color": "#FFD700",
    "dark_secondary_color": "#5F574F",
    "dark_accent_color": "#FFA500"
  }
}
```

**Notes:**
- `branding` is `null` if user has no university or university has no branding set
- All users from the same university receive the same branding
- Branding is automatically included on every login

---

## 📋 Complete API Summary

### Authentication Endpoints

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `/api/v1/auth/login` | POST | Public | ✅ Modified (added `branding` field) |
| `/api/v1/auth/register` | POST | Public | ❌ Removed |
| `/api/v1/auth/refresh` | POST | Public | ✅ Unchanged |
| `/api/v1/auth/logout` | POST | Authenticated | ✅ Unchanged |
| `/api/v1/auth/me` | GET | Authenticated | ✅ Unchanged |
| `/api/v1/auth/template` | GET | Authenticated | ✅ Unchanged |
| `/api/v1/auth/template` | PUT | Admin | ✅ Unchanged |
| `/api/v1/auth/branding` | GET | Authenticated | 🆕 **NEW** |
| `/api/v1/auth/branding` | PUT | Admin | 🆕 **NEW** |

---

## 🎨 Branding Data Structure

```typescript
interface UniversityBranding {
  logo_url: string | null;
  light_primary_color: string | null;    // Hex: #B1810B
  light_secondary_color: string | null;  // Hex: #2E2D29
  light_accent_color: string | null;     // Hex: #E6A82D
  dark_primary_color: string | null;     // Hex: #FFD700
  dark_secondary_color: string | null;   // Hex: #5F574F
  dark_accent_color: string | null;      // Hex: #FFA500
}
```

---

## 🔑 Key Points for Frontend

1. **Login Response:** Always check for `branding` field in login response
2. **Branding Updates:** Use `PUT /api/v1/auth/branding` when admin updates branding
3. **Color Format:** All colors are hex format (e.g., "#B1810B")
4. **Optional Fields:** All branding fields are optional - only send fields you want to update
5. **University Scoping:** All users from the same university receive the same branding
6. **Null Handling:** `branding` can be `null` if not set or user has no university

---

## 📝 Example Usage

### Admin Sets Branding (First Time)
```javascript
// Admin logs in
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin@mit.edu',
    password: 'mit123'
  })
});

const { access_token } = await loginResponse.json();

// Admin sets branding
const brandingResponse = await fetch('/api/v1/auth/branding', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    logo_url: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=200&h=200&fit=crop',
    light_primary_color: '#B1810B',
    light_secondary_color: '#2E2D29',
    light_accent_color: '#E6A82D',
    dark_primary_color: '#FFD700',
    dark_secondary_color: '#5F574F',
    dark_accent_color: '#FFA500'
  })
});
```

### Alumni Receives Branding on Login
```javascript
// Alumni logs in
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john.doe@mit.edu',
    password: 'mit123'
  })
});

const { access_token, branding } = await loginResponse.json();

// Use branding to style UI
if (branding) {
  document.documentElement.style.setProperty('--primary-color', branding.light_primary_color);
  document.documentElement.style.setProperty('--secondary-color', branding.light_secondary_color);
  document.documentElement.style.setProperty('--accent-color', branding.light_accent_color);
  
  // Set logo
  document.getElementById('logo').src = branding.logo_url;
}
```

---

## ✅ Summary

- ✅ **2 new endpoints** added (GET/PUT branding)
- ✅ **Login response** updated with `branding` field
- ✅ **All other endpoints** unchanged
- ✅ **Postman collection** updated

