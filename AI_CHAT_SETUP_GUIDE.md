# 🤖 AI Chat Setup Guide

**Step-by-Step Guide to Set Up AI Chat on University Documents**

---

## 📋 Prerequisites

1. PostgreSQL database running
2. Python 3.8+ installed
3. OpenAI API key
4. All dependencies installed

---

## 🚀 Setup Steps

### Step 1: Run Database Migration

Add `university_id` column to `documents` table:

```bash
# Option 1: Using Alembic
alembic upgrade head

# Option 2: Manual SQL
psql -U your_user -d your_database -f migration.sql
```

**Migration SQL:**
```sql
-- Add university_id column
ALTER TABLE documents 
ADD COLUMN university_id INTEGER;

-- Create index
CREATE INDEX ix_documents_university_id ON documents(university_id);

-- Add foreign key
ALTER TABLE documents 
ADD CONSTRAINT fk_document_university 
FOREIGN KEY (university_id) 
REFERENCES universities(id) 
ON DELETE SET NULL;

-- Update existing documents
UPDATE documents d
SET university_id = u.university_id
FROM users u
WHERE d.uploader_id = u.id
AND u.university_id IS NOT NULL;
```

---

### Step 2: Configure Environment Variables

Add to `.env` file:

```env
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=text-embedding-3-small

# ChromaDB Configuration
CHROMA_PERSIST_DIRECTORY=./chroma_db
CHROMA_COLLECTION_NAME=alumni_documents

# File Upload Settings
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=["pdf","doc","docx","txt","md"]
```

**Get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy and paste into `.env`

---

### Step 3: Install Dependencies

```bash
pip install openai chromadb tiktoken
```

---

### Step 4: Ensure Users Have University Association

Users must be associated with a university to use chat:

```sql
-- Check users without university
SELECT id, username, email, university_id 
FROM users 
WHERE university_id IS NULL;

-- Associate user with university (example)
UPDATE users 
SET university_id = 1 
WHERE id = 5;
```

---

### Step 5: Upload Documents (As Admin)

**Using API:**

```typescript
// Upload document
const formData = new FormData();
formData.append('file', file);  // PDF, DOC, DOCX, TXT, MD
formData.append('title', 'Admission Guide 2025');
formData.append('description', 'Complete admission requirements');
formData.append('is_public', 'true');

const response = await apiClient.post('/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Document will be automatically:
// 1. Associated with admin's university
// 2. Processed (text extraction, chunking, embeddings)
// 3. Stored in ChromaDB
```

**Check Document Status:**

```typescript
const document = await apiClient.get(`/documents/${documentId}`);
// Status: "uploaded" → "processing" → "processed" (or "failed")
```

---

### Step 6: Test Chat API

```typescript
// Send first message (creates session)
const response = await apiClient.post('/chat/message', {
  content: "What are the admission requirements?",
  session_id: null,
});

console.log(response.data);
// {
//   message: { content: "AI response...", ... },
//   session: { id: 1, ... },
//   sources: [{ document_id: 5, title: "Admission Guide" }]
// }

// Continue conversation
const response2 = await apiClient.post('/chat/message', {
  content: "What about scholarships?",
  session_id: response.data.session.id,
});
```

---

## ✅ Verification Checklist

- [ ] Database migration applied successfully
- [ ] `university_id` column exists in `documents` table
- [ ] OpenAI API key set in `.env`
- [ ] ChromaDB directory created (`./chroma_db`)
- [ ] Users have `university_id` set
- [ ] At least one document uploaded and processed
- [ ] Document status is `processed` (not `failed`)
- [ ] Chat API returns responses with sources

---

## 🧪 Testing

### Test 1: Upload Document

```bash
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@admission_guide.pdf" \
  -F "title=Admission Guide 2025" \
  -F "description=Complete admission requirements" \
  -F "is_public=true"
```

### Test 2: Check Document Status

```bash
curl -X GET "http://localhost:8000/api/v1/documents/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Wait until `status: "processed"`

### Test 3: Send Chat Message

```bash
curl -X POST "http://localhost:8000/api/v1/chat/message" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "What are the admission requirements?",
    "session_id": null
  }'
```

---

## 🔧 Troubleshooting

### Issue: "OpenAI API key not configured"

**Solution:** Add `OPENAI_API_KEY` to `.env` file

### Issue: Document status stuck on "processing"

**Solution:** 
- Check OpenAI API key is valid
- Check logs for errors
- Manually update status: `UPDATE documents SET status='failed' WHERE id=1;`

### Issue: "No relevant documents found"

**Solution:**
- Ensure documents are `processed` (not `uploaded` or `processing`)
- Check user has `university_id` set
- Verify documents have `university_id` matching user's university

### Issue: ChromaDB errors

**Solution:**
- Delete `./chroma_db` directory and restart
- Check disk space
- Verify `CHROMA_PERSIST_DIRECTORY` path is writable

---

## 📊 Database Schema Summary

### Documents Table
```sql
documents (
    id, title, description, file_path, file_name,
    file_size, file_type, mime_type, status,
    is_public, uploader_id, university_id,  -- NEW
    chroma_id, metadata, created_at, updated_at
)
```

### Document Embeddings Table
```sql
document_embeddings (
    id, document_id, chunk_index, chunk_text,
    chunk_start, chunk_end, embedding_vector_id,
    metadata, created_at, updated_at
)
```

### Chat Sessions Table
```sql
chat_sessions (
    id, user_id, title, is_active,
    last_message_at, created_at, updated_at
)
```

### Chat Messages Table
```sql
chat_messages (
    id, session_id, role, content,
    metadata, tokens_used, created_at, updated_at
)
```

---

## 🎯 Key Features Implemented

✅ **University-Specific Documents**: Documents automatically associated with uploader's university  
✅ **University-Filtered Chat**: Users can only chat about documents from their university  
✅ **RAG Implementation**: Semantic search + AI generation  
✅ **Source Citations**: Responses include document sources  
✅ **Chat History**: All conversations saved  
✅ **Automatic Processing**: Documents processed automatically on upload  

---

**Status:** ✅ Ready for Production  
**Last Updated:** December 10, 2025

