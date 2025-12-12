# Likes and Comments - Use Case Explanation

## Overview

**Likes and Comments are NOT filters** - they are **engagement features** that allow users to interact with posts in the alumni portal feed.

---

## 🎯 What Are Likes?

### Purpose
Likes are a way for users to show appreciation or agreement with a post without writing a comment.

### Use Cases:
1. **Quick Engagement**: Users can quickly show they appreciate a post (e.g., "Congratulations on your promotion!")
2. **Social Validation**: Posts with more likes appear more popular/important
3. **Non-Verbal Feedback**: Users can express support without commenting

### How It Works:
- **Toggle Like**: Clicking the like button once adds a like, clicking again removes it
- **Like Count**: Each post shows how many users have liked it
- **User Liked Status**: The API tells you if the current user has liked the post (for UI highlighting)

### API Endpoint:
```
POST /api/v1/feed/posts/{post_id}/like
```

**Response:**
```json
{
  "liked": true,
  "message": "Post liked"
}
```
or
```json
{
  "liked": false,
  "message": "Post unliked"
}
```

### In Post Response:
```json
{
  "id": 1,
  "content": "Post content...",
  "likes_count": 45,        // Total number of likes
  "user_liked": true,       // Whether current user liked it
  "likes": []               // Array of like objects (when getting single post)
}
```

---

## 💬 What Are Comments?

### Purpose
Comments allow users to have discussions, ask questions, or provide detailed feedback on posts.

### Use Cases:
1. **Discussion**: Users can discuss topics mentioned in posts
2. **Questions**: Alumni can ask questions about career advice, opportunities, etc.
3. **Congratulatory Messages**: Users can write detailed congratulatory messages
4. **Community Building**: Encourages interaction and networking among alumni

### How It Works:
- **Add Comment**: Users can add text comments to any post
- **Comment Count**: Each post shows how many comments it has
- **View Comments**: When viewing a single post, all comments are displayed
- **Delete Comments**: Users can delete their own comments (or admins can delete any)

### API Endpoints:

#### Add Comment:
```
POST /api/v1/feed/posts/{post_id}/comments
```

**Request:**
```json
{
  "content": "Great post! Congratulations!"
}
```

**Response:**
```json
{
  "id": 1,
  "content": "Great post! Congratulations!",
  "post_id": 1,
  "author_id": 6,
  "author_name": "Another User",
  "status": "active",
  "created_at": "2025-12-11T10:05:00",
  "updated_at": "2025-12-11T10:05:00"
}
```

#### Delete Comment:
```
DELETE /api/v1/feed/comments/{comment_id}
```

### In Post Response:
```json
{
  "id": 1,
  "content": "Post content...",
  "comments_count": 8,      // Total number of comments
  "comments": [             // Array of comment objects (when getting single post)
    {
      "id": 1,
      "content": "Congratulations!",
      "post_id": 1,
      "author_id": 6,
      "author_name": "Another User",
      "status": "active",
      "created_at": "2025-12-11T10:05:00",
      "updated_at": "2025-12-11T10:05:00"
    }
  ]
}
```

---

## 🔍 Key Differences: Filters vs. Engagement Features

### Filters (Used to SEARCH posts):
- **Tag**: Filter posts by category (success_story, career_milestone, etc.)
- **University ID**: Filter posts by university
- **Purpose**: Help users find specific types of posts

### Engagement Features (Used to INTERACT with posts):
- **Likes**: Quick way to show appreciation
- **Comments**: Detailed discussion and feedback
- **Purpose**: Encourage community interaction and engagement

---

## 📊 Example User Flow

1. **User browses feed** → Sees posts with `likes_count` and `comments_count`
2. **User clicks like button** → Calls `POST /api/v1/feed/posts/1/like`
   - Post now shows `user_liked: true` and `likes_count` increases
3. **User wants to comment** → Clicks "Add Comment"
   - Calls `POST /api/v1/feed/posts/1/comments` with comment text
   - Comment appears in the post's comments list
4. **User views single post** → Calls `GET /api/v1/feed/posts/1`
   - Gets full post with all comments and likes displayed

---

## 🎨 Frontend Implementation

### Displaying Likes:
```javascript
// Show like button with count
<button onClick={toggleLike}>
  {post.user_liked ? '❤️' : '🤍'} {post.likes_count}
</button>
```

### Displaying Comments:
```javascript
// Show comment count
<div>💬 {post.comments_count} comments</div>

// When viewing post details, show all comments
{post.comments.map(comment => (
  <div key={comment.id}>
    <strong>{comment.author_name}:</strong> {comment.content}
  </div>
))}
```

---

## ✅ Summary

- **Likes**: Quick engagement feature - users can like/unlike posts
- **Comments**: Discussion feature - users can add/delete comments on posts
- **NOT Filters**: These are engagement features, not search filters
- **Displayed in Posts**: Each post shows `likes_count`, `comments_count`, and `user_liked` status
- **Full Details**: When viewing a single post, you get arrays of all `likes` and `comments`

These features help build an active, engaged alumni community where users can interact with each other's posts!

