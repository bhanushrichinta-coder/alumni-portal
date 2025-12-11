# 🤖 AI Chat API Documentation

**Complete Guide for AI-Powered Document Chat Feature**

**Base URL:** `http://localhost:8000/api/v1`  
**Feature:** RAG (Retrieval Augmented Generation) Chat on University Documents

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Database Tables](#database-tables)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Frontend Integration](#frontend-integration)
7. [Setup & Configuration](#setup--configuration)

---

## 🎯 Overview

The AI Chat feature allows users to ask questions about documents uploaded by university admins. The system uses:

- **RAG (Retrieval Augmented Generation)**: Searches relevant document chunks and uses them as context for AI responses
- **Vector Search**: Uses ChromaDB for semantic search on document embeddings
- **OpenAI Integration**: Generates intelligent responses based on document context
- **University Filtering**: Users can only chat about documents from their university

### Key Features

✅ **University-Specific Documents**: Admins upload documents for their university  
✅ **Semantic Search**: Finds relevant document sections using AI embeddings  
✅ **Context-Aware Responses**: AI answers based on actual document content  
✅ **Source Citations**: Responses include document sources  
✅ **Chat History**: All conversations are saved and retrievable  

---

## 🔄 How It Works

### Flow Diagram

```
1. Admin Uploads Document
   ↓
2. Document Processing
   ├─ Extract text from PDF/DOC/etc.
   ├─ Split into chunks (1000 chars with 200 overlap)
   ├─ Generate embeddings (OpenAI)
   └─ Store in ChromaDB vector database
   ↓
3. User Asks Question
   ↓
4. RAG Process
   ├─ Generate query embedding
   ├─ Search similar chunks in ChromaDB (filtered by university)
   ├─ Retrieve top 5 relevant chunks
   └─ Build context from chunks
   ↓
5. AI Response Generation
   ├─ Send context + question to OpenAI
   ├─ Get AI response
   └─ Include source citations
   ↓
6. Save Conversation
   ├─ Save user message
   ├─ Save AI response with sources
   └─ Update chat session
```

---

## 🗄️ Database Tables

### Required Tables

#### 1. `documents` Table

Stores uploaded documents and their metadata.

```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(512) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type documenttype NOT NULL,  -- pdf, doc, docx, txt, md, other
    mime_type VARCHAR(100) NOT NULL,
    status documentstatus NOT NULL DEFAULT 'uploaded',  -- uploaded, processing, processed, failed
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    uploader_id INTEGER NOT NULL,  -- User who uploaded
    university_id INTEGER,  -- University this document belongs to (NEW)
    chroma_id VARCHAR(255),  -- ChromaDB document ID
    metadata TEXT,  -- JSON metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_uploader FOREIGN KEY (uploader_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_document_university FOREIGN KEY (university_id) 
        REFERENCES universities(id) ON DELETE SET NULL
);

CREATE INDEX ix_documents_university_id ON documents(university_id);
```

#### 2. `document_embeddings` Table

Stores document chunks and their embedding metadata.

```sql
CREATE TABLE document_embeddings (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_start INTEGER,
    chunk_end INTEGER,
    embedding_vector_id VARCHAR(255),  -- Reference to ChromaDB
    metadata TEXT,  -- JSON metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_embedding_document FOREIGN KEY (document_id) 
        REFERENCES documents(id) ON DELETE CASCADE
);
```

#### 3. `chat_sessions` Table

Stores chat conversation sessions.

```sql
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_session_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);
```

#### 4. `chat_messages` Table

Stores individual chat messages.

```sql
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL,  -- user, assistant, system
    content TEXT NOT NULL,
    metadata TEXT,  -- JSON: sources, citations, etc.
    tokens_used INTEGER,  -- For tracking API usage
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_session FOREIGN KEY (session_id) 
        REFERENCES chat_sessions(id) ON DELETE CASCADE
);
```

#### 5. `universities` Table

Stores university information.

```sql
CREATE TABLE universities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) UNIQUE,
    website_template VARCHAR(100),
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. `users` Table (Existing)

Users table with `university_id` field.

```sql
-- users table already has:
university_id INTEGER REFERENCES universities(id) ON DELETE SET NULL
```

---

## 🔌 API Endpoints

### 1. Upload Document (Admin)

**Endpoint:** `POST /api/v1/documents/upload`

**Auth Required:** ✅ Yes

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File (required) - PDF, DOC, DOCX, TXT, MD
- `title`: string (required)
- `description?: string`
- `is_public?: boolean` (default: false)

**Response:** `201 Created`
```typescript
{
  document: {
    id: number;
    title: string;
    description: string | null;
    file_name: string;
    file_size: number;
    file_type: string;
    status: "uploaded" | "processing" | "processed" | "failed";
    is_public: boolean;
    uploader_id: number;
    university_id: number | null;  // Automatically set from uploader's university
    created_at: string;
    updated_at: string;
  };
  message: "Document uploaded successfully";
}
```

**Note:** 
- Document is automatically associated with uploader's university
- Document processing (text extraction, chunking, embeddings) happens automatically
- Status changes: `uploaded` → `processing` → `processed` (or `failed`)

---

### 2. Send Chat Message

**Endpoint:** `POST /api/v1/chat/message`

**Auth Required:** ✅ Yes

**Request:**
```typescript
{
  content: string;              // Required, min 1 char
  session_id?: number | null;   // If null, creates new session
}
```

**Response:** `200 OK`
```typescript
{
  message: {
    id: number;
    session_id: number;
    role: "assistant";
    content: string;            // AI-generated response
    metadata: string | null;    // JSON string with sources
    tokens_used: number | null;
    created_at: string;
  };
  session: {
    id: number;
    user_id: number;
    title: string | null;
    is_active: boolean;
    last_message_at: string | null;
    created_at: string;
    updated_at: string;
  };
  sources?: Array<{             // Document sources used for response
    document_id: number;
    chunk_index: number;
    title: string;
  }>;
}
```

**How It Works:**
1. User sends question
2. System generates embedding for question
3. Searches ChromaDB for similar document chunks (filtered by user's university)
4. Retrieves top 5 relevant chunks
5. Sends context + question to OpenAI
6. Returns AI response with source citations

**Example Request:**
```typescript
const response = await apiClient.post('/chat/message', {
  content: "What are the admission requirements?",
  session_id: null  // Creates new session
});
```

**Example Response:**
```json
{
  "message": {
    "id": 1,
    "session_id": 1,
    "role": "assistant",
    "content": "Based on the university documents, the admission requirements include:\n\n1. High school diploma or equivalent\n2. Minimum GPA of 3.0\n3. SAT/ACT scores\n4. Letters of recommendation\n\nFor more details, please refer to the official admission guide.",
    "metadata": "{\"sources\": [{\"document_id\": 5, \"chunk_index\": 2, \"title\": \"Admission Guide 2025\"}]}",
    "tokens_used": 150,
    "created_at": "2025-12-10T12:00:00"
  },
  "session": {
    "id": 1,
    "user_id": 1,
    "title": "Chat 2025-12-10 12:00",
    "is_active": true,
    "last_message_at": "2025-12-10T12:00:00",
    "created_at": "2025-12-10T12:00:00",
    "updated_at": "2025-12-10T12:00:00"
  },
  "sources": [
    {
      "document_id": 5,
      "chunk_index": 2,
      "title": "Admission Guide 2025"
    }
  ]
}
```

---

### 3. List Chat Sessions

**Endpoint:** `GET /api/v1/chat/sessions?skip=0&limit=50`

**Auth Required:** ✅ Yes

**Query Parameters:**
- `skip?: number` (default: 0)
- `limit?: number` (default: 50)

**Response:** `200 OK`
```typescript
Array<{
  id: number;
  user_id: number;
  title: string | null;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}>
```

---

### 4. Get Chat Session with Messages

**Endpoint:** `GET /api/v1/chat/sessions/{session_id}`

**Auth Required:** ✅ Yes

**Response:** `200 OK`
```typescript
{
  id: number;
  user_id: number;
  title: string | null;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  messages: Array<{
    id: number;
    session_id: number;
    role: "user" | "assistant";
    content: string;
    metadata: string | null;
    tokens_used: number | null;
    created_at: string;
  }>;
}
```

---

### 5. List Documents

**Endpoint:** `GET /api/v1/documents?skip=0&limit=100`

**Auth Required:** ⚠️ Optional

**Query Parameters:**
- `skip?: number` (default: 0)
- `limit?: number` (default: 100)

**Response:** `200 OK`
```typescript
Array<{
  id: number;
  title: string;
  description: string | null;
  file_name: string;
  file_size: number;
  file_type: string;
  status: string;
  is_public: boolean;
  uploader_id: number;
  university_id: number | null;
  created_at: string;
  updated_at: string;
}>
```

**Note:** Returns documents based on user's university and access permissions.

---

### 6. Search Documents (Vector Search)

**Endpoint:** `POST /api/v1/documents/search`

**Auth Required:** ⚠️ Optional

**Request:**
```typescript
{
  query: string;      // Required, min 1 char
  limit?: number;     // Default: 10, min: 1, max: 50
}
```

**Response:** `200 OK`
```typescript
Array<{
  document_id: number;
  document_title: string;
  chunk_text: string;
  chunk_index: number;
  similarity_score: number;  // 0-1, higher is more similar
  metadata?: Record<string, any>;
}>
```

---

## 💻 Frontend Integration

### Complete React Example

```typescript
// hooks/useChat.ts
import { useState, useCallback } from 'react';
import apiClient from '../api/client';
import { ChatMessage, ChatSession, ChatResponse } from '../types';

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const response = await apiClient.get('/chat/sessions');
      setSessions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load sessions');
    }
  }, []);

  const loadSession = useCallback(async (sessionId: number) => {
    try {
      const response = await apiClient.get(`/chat/sessions/${sessionId}`);
      setCurrentSession(response.data);
      setMessages(response.data.messages);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load session');
    }
  }, []);

  const sendMessage = useCallback(async (content: string, sessionId?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<ChatResponse>('/chat/message', {
        content,
        session_id: sessionId || null,
      });

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now(), // Temporary ID
        session_id: response.data.session.id,
        role: 'user',
        content,
        metadata: null,
        tokens_used: null,
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage, response.data.message]);
      setCurrentSession(response.data.session);
      
      // Reload sessions to update last_message_at
      await loadSessions();
      
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadSessions]);

  return {
    sessions,
    currentSession,
    messages,
    loading,
    error,
    loadSessions,
    loadSession,
    sendMessage,
  };
}
```

### React Component Example

```typescript
// components/ChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';

export function ChatInterface() {
  const { currentSession, messages, loading, error, sendMessage, loadSessions } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const content = input.trim();
    setInput('');

    try {
      await sendMessage(content, currentSession?.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI Assistant</h2>
        <p>Always here to help</p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>Hi! 👋 I'm your University AI Assistant. I can help answer questions about admissions, scholarships, campus life, and more.</p>
            <div className="suggested-questions">
              <p>Try asking:</p>
              <button onClick={() => setInput("What are the admission requirements?")}>
                What are the admission requirements?
              </button>
              <button onClick={() => setInput("Tell me about scholarship opportunities")}>
                Tell me about scholarship opportunities
              </button>
              <button onClick={() => setInput("What clubs and organizations are available?")}>
                What clubs and organizations are available?
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content}
            </div>
            {message.role === 'assistant' && message.metadata && (
              <div className="sources">
                Sources: {JSON.parse(message.metadata).sources?.map((s: any) => s.title).join(', ')}
              </div>
            )}
            <div className="message-time">
              {new Date(message.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-content">Thinking...</div>
          </div>
        )}

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
```

---

## ⚙️ Setup & Configuration

### 1. Environment Variables

Add to `.env`:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=text-embedding-3-small  # or text-embedding-ada-002

# ChromaDB Configuration
CHROMA_PERSIST_DIRECTORY=./chroma_db
CHROMA_COLLECTION_NAME=alumni_documents

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_EXTENSIONS=["pdf","doc","docx","txt","md"]
```

### 2. Install Dependencies

```bash
pip install openai chromadb tiktoken
```

### 3. Run Database Migration

```bash
# Create migration
alembic revision --autogenerate -m "add_university_id_to_documents"

# Apply migration
alembic upgrade head
```

Or manually run SQL:

```sql
ALTER TABLE documents ADD COLUMN university_id INTEGER;
CREATE INDEX ix_documents_university_id ON documents(university_id);
ALTER TABLE documents ADD CONSTRAINT fk_document_university 
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE SET NULL;

-- Update existing documents
UPDATE documents d
SET university_id = u.university_id
FROM users u
WHERE d.uploader_id = u.id
AND u.university_id IS NOT NULL;
```

### 4. Initialize ChromaDB

ChromaDB will be automatically initialized on first use. The directory will be created at `CHROMA_PERSIST_DIRECTORY`.

---

## 🔍 How University Filtering Works

### Document Upload Flow

1. **Admin uploads document**
   - Admin must be associated with a university (`user.university_id`)
   - Document is automatically assigned `university_id = user.university_id`
   - Document is processed and stored in ChromaDB with `university_id` in metadata

### Chat Flow

1. **User sends message**
   - System gets user's `university_id`
   - Generates query embedding
   - Searches ChromaDB with filter: `university_id = user.university_id`
   - Only retrieves document chunks from user's university
   - Generates AI response based on university-specific documents

### Access Control

- **University Admin**: Can upload documents for their university
- **Alumni/Users**: Can only chat about documents from their university
- **Public Documents**: If `is_public=true`, accessible to all (but still filtered by university in chat)
- **Super Admin**: Can access all documents

---

## 📊 TypeScript Types

```typescript
// Chat Types
export interface ChatMessage {
  id: number;
  session_id: number;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: string | null;  // JSON string with sources
  tokens_used: number | null;
  created_at: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string | null;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageCreate {
  content: string;
  session_id?: number | null;
}

export interface ChatResponse {
  message: ChatMessage;
  session: ChatSession;
  sources?: Array<{
    document_id: number;
    chunk_index: number;
    title: string;
  }>;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

// Document Types
export interface Document {
  id: number;
  title: string;
  description: string | null;
  file_name: string;
  file_size: number;
  file_type: string;
  status: "uploaded" | "processing" | "processed" | "failed";
  is_public: boolean;
  uploader_id: number;
  university_id: number | null;  // NEW
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadResponse {
  document: Document;
  message: string;
}
```

---

## 🧪 Testing

### Test Document Upload

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'Admission Guide 2025');
formData.append('description', 'Complete guide for university admissions');
formData.append('is_public', 'true');

const response = await apiClient.post('/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

### Test Chat

```typescript
// First message (creates session)
const response1 = await apiClient.post('/chat/message', {
  content: "What are the admission requirements?",
  session_id: null,
});

const sessionId = response1.data.session.id;

// Continue conversation
const response2 = await apiClient.post('/chat/message', {
  content: "What about scholarships?",
  session_id: sessionId,
});
```

---

## ⚠️ Important Notes

### 1. Document Processing
- Documents are processed asynchronously
- Status: `uploaded` → `processing` → `processed` (or `failed`)
- Only `processed` documents are searchable in chat
- Processing time depends on document size (typically 5-30 seconds)

### 2. University Association
- Documents are automatically associated with uploader's university
- Users can only chat about documents from their university
- Super admins can access all documents

### 3. OpenAI API
- Requires valid OpenAI API key
- Uses `text-embedding-3-small` for embeddings (or `text-embedding-ada-002`)
- Uses `gpt-3.5-turbo` for chat responses
- Costs: ~$0.0001 per query (embeddings) + ~$0.002 per response

### 4. ChromaDB
- Stores document embeddings locally
- Automatically persists to disk
- No external service required
- Collection name: `alumni_documents`

### 5. Error Handling
- If OpenAI API fails, returns error message
- If no relevant documents found, AI still responds (without context)
- If document processing fails, status = `failed`

---

## 🚀 Quick Start Checklist

- [ ] Add `OPENAI_API_KEY` to `.env`
- [ ] Run database migration for `university_id` in documents
- [ ] Ensure users have `university_id` set
- [ ] Upload test documents as admin
- [ ] Wait for documents to process (check status)
- [ ] Test chat endpoint
- [ ] Verify university filtering works

---

**Last Updated:** December 10, 2025  
**Status:** ✅ Production Ready  
**Feature:** AI Chat with RAG on University Documents

