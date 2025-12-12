# Posts Filtering System

## Overview

Posts now support filtering by **Tags**, **Company**, and **University**. All filters work together (AND logic) - when multiple filters are selected, only posts matching ALL selected filters are returned.

## Filter Options

### Tags
- `success_story` - Success Story
- `career_milestone` - Career Milestone  
- `achievement` - Achievement
- `learning_journey` - Learning Journey
- `volunteering` - Volunteering

### Company
- Free text field - filters by company name (case-insensitive partial match)
- Examples: "TechCorp", "Google", "Microsoft", "Meta", etc.

### University
- Filter by university ID
- Alumni users see their university's posts by default
- Can filter by specific university ID

## API Endpoints

### 1. Get Filter Options
**Endpoint:** `GET /api/v1/feed/posts/filters/options`

**Response:**
```json
{
  "tags": [
    {"value": "success_story", "label": "Success Story"},
    {"value": "career_milestone", "label": "Career Milestone"},
    {"value": "achievement", "label": "Achievement"},
    {"value": "learning_journey", "label": "Learning Journey"},
    {"value": "volunteering", "label": "Volunteering"}
  ],
  "companies": [
    "Adobe",
    "Google",
    "Meta",
    "Microsoft",
    "Spotify",
    "TechCorp"
  ],
  "universities": [
    {"id": 1, "name": "Tech University"},
    {"id": 2, "name": "Business University"}
  ]
}
```

### 2. List Posts with Filters
**Endpoint:** `GET /api/v1/feed/posts`

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `page_size` (optional, default: 20) - Items per page
- `tag` (optional) - Filter by tag: `success_story`, `career_milestone`, `achievement`, `learning_journey`, `volunteering`
- `company` (optional) - Filter by company name (partial match)
- `university_id` (optional) - Filter by university ID

**Example Requests:**

1. **Filter by Tag only:**
   ```
   GET /api/v1/feed/posts?tag=career_milestone
   ```

2. **Filter by Company only:**
   ```
   GET /api/v1/feed/posts?company=TechCorp
   ```

3. **Filter by University only:**
   ```
   GET /api/v1/feed/posts?university_id=2
   ```

4. **Filter by ALL (Tag + Company + University):**
   ```
   GET /api/v1/feed/posts?tag=career_milestone&company=TechCorp&university_id=2
   ```
   Returns posts that match ALL three filters.

5. **Filter by Tag + Company:**
   ```
   GET /api/v1/feed/posts?tag=achievement&company=Google
   ```
   Returns posts with tag "achievement" AND company "Google".

## Filter Logic

**AND Logic:** All selected filters are combined with AND logic. A post must match ALL selected filters to be returned.

**Examples:**
- Tag: `career_milestone` + Company: `TechCorp` → Returns posts with tag "career_milestone" AND company "TechCorp"
- Tag: `success_story` + University: `2` → Returns posts with tag "success_story" AND from university ID 2
- Tag: `achievement` + Company: `Google` + University: `1` → Returns posts matching all three

## Creating Posts with Tags and Company

**Endpoint:** `POST /api/v1/feed/posts`

**Request:**
```json
{
  "content": "Excited to share that I just got promoted to Senior Engineer at TechCorp!",
  "tag": "career_milestone",
  "company": "TechCorp"
}
```

**Available Tags:**
- `success_story`
- `career_milestone`
- `achievement`
- `learning_journey`
- `volunteering`

## Frontend Implementation

### Step 1: Load Filter Options
```javascript
// Get available filter options
const response = await fetch('/api/v1/feed/posts/filters/options');
const { tags, companies, universities } = await response.json();

// Populate filter UI
// - Tags: Show as buttons/checkboxes
// - Companies: Show as radio buttons or dropdown
// - Universities: Show as radio buttons or dropdown
```

### Step 2: User Selects Filters
```javascript
// User selects:
// - Tag: "career_milestone"
// - Company: "TechCorp"
// - University: 2
```

### Step 3: Apply Filters
```javascript
// Build query string with all selected filters
const params = new URLSearchParams();
if (selectedTag) params.append('tag', selectedTag);
if (selectedCompany) params.append('company', selectedCompany);
if (selectedUniversityId) params.append('university_id', selectedUniversityId);

// Fetch filtered posts
const response = await fetch(`/api/v1/feed/posts?${params.toString()}`);
const { posts, total, page, page_size, total_pages } = await response.json();
```

### Step 4: Display Results
All returned posts match ALL selected filters.

## Notes

- **Jobs are now part of Posts**: Use tags like `career_milestone` and include company name
- **Multiple filters**: All filters work together (AND logic)
- **Empty filters**: If no filters are selected, all posts are returned (subject to university filtering for alumni)
- **Case-insensitive**: Company filter is case-insensitive and supports partial matching
- **Alumni default**: Alumni users see posts from their university by default unless `university_id` is specified

