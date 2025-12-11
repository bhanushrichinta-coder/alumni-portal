# 🤖 Frontend AI Chat Integration Guide

**Complete Guide for Integrating AI Chat Feature in Frontend**

---

## 🎯 Overview

The AI Chat feature allows users to ask questions about documents uploaded by university admins. The system uses RAG (Retrieval Augmented Generation) to provide intelligent, context-aware responses based on actual document content.

**Key Features:**
- ✅ University-specific documents (admins upload for their university)
- ✅ AI-powered chat with document context
- ✅ Source citations in responses
- ✅ Chat history and session management
- ✅ Automatic university filtering

---

## 🔑 Authentication

All chat endpoints require authentication. Include Bearer token in headers:

```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

---

## 📡 API Endpoints

### 1. Upload Document (Admin Only)

**Endpoint:** `POST /api/v1/documents/upload`

**Auth Required:** ✅ Yes (University Admin or Super Admin)

**Content-Type:** `multipart/form-data`

**Request:**
```typescript
FormData:
  - file: File (PDF, DOC, DOCX, TXT, MD)
  - title: string (required)
  - description?: string
  - is_public?: boolean (default: false)
```

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
    university_id: number | null;  // Automatically set from admin's university
    created_at: string;
    updated_at: string;
  };
  message: "Document uploaded successfully";
}
```

**Example:**
```typescript
const uploadDocument = async (file: File, title: string, description?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  if (description) formData.append('description', description);
  formData.append('is_public', 'true');

  const response = await apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};
```

**Important Notes:**
- Document is automatically associated with admin's university
- Document processing happens automatically (5-30 seconds)
- Check `status` field - must be `"processed"` before chat works
- Only `processed` documents are searchable

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
    metadata: string | null;   // JSON string with sources
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
  sources?: Array<{             // Document sources used
    document_id: number;
    chunk_index: number;
    title: string;
  }>;
}
```

**Example:**
```typescript
const sendMessage = async (content: string, sessionId?: number) => {
  const response = await apiClient.post('/chat/message', {
    content,
    session_id: sessionId || null,
  });

  // Parse sources from metadata
  const sources = response.data.sources || [];
  
  return {
    ...response.data,
    sources: sources.map(s => ({
      documentId: s.document_id,
      title: s.title,
      chunkIndex: s.chunk_index,
    })),
  };
};
```

**How It Works:**
1. User sends question
2. System searches documents from user's university
3. Finds relevant document chunks
4. Sends context + question to OpenAI
5. Returns AI response with source citations

**University Filtering:**
- Automatically filters by user's `university_id`
- Users only see documents from their university
- No manual filtering needed

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

**Example:**
```typescript
const loadSessions = async () => {
  const response = await apiClient.get('/chat/sessions');
  return response.data;
};
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

**Example:**
```typescript
const loadSession = async (sessionId: number) => {
  const response = await apiClient.get(`/chat/sessions/${sessionId}`);
  return response.data;
};
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
  status: "uploaded" | "processing" | "processed" | "failed";
  is_public: boolean;
  uploader_id: number;
  university_id: number | null;
  created_at: string;
  updated_at: string;
}>
```

**Note:** Returns only documents from user's university (if authenticated) or public documents.

---

### 6. Search Documents (Vector Search)

**Endpoint:** `POST /api/v1/documents/search`

**Auth Required:** ⚠️ Optional

**Request:**
```typescript
{
  query: string;      // Required
  limit?: number;      // Default: 10
}
```

**Response:** `200 OK`
```typescript
Array<{
  document_id: number;
  document_title: string;
  chunk_text: string;
  chunk_index: number;
  similarity_score: number;  // 0-1
  metadata?: Record<string, any>;
}>
```

**Note:** Automatically filtered by user's university.

---

## 💻 Complete React Integration Example

### API Client Setup

```typescript
// src/api/client.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Chat Hook

```typescript
// src/hooks/useChat.ts
import { useState, useCallback } from 'react';
import apiClient from '../api/client';

interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  metadata: string | null;
  created_at: string;
}

interface ChatSession {
  id: number;
  user_id: number;
  title: string | null;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatResponse {
  message: ChatMessage;
  session: ChatSession;
  sources?: Array<{
    document_id: number;
    chunk_index: number;
    title: string;
  }>;
}

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
      // Add user message to UI immediately
      const tempUserMessage: ChatMessage = {
        id: Date.now(),
        session_id: sessionId || 0,
        role: 'user',
        content,
        metadata: null,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Send to API
      const response = await apiClient.post<ChatResponse>('/chat/message', {
        content,
        session_id: sessionId || null,
      });

      // Replace temp message and add AI response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMessage.id);
        return [
          ...filtered,
          {
            id: Date.now() + 1,
            session_id: response.data.session.id,
            role: 'user' as const,
            content,
            metadata: null,
            created_at: new Date().toISOString(),
          },
          response.data.message,
        ];
      });

      setCurrentSession(response.data.session);
      await loadSessions();

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== Date.now()));
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

### Chat Component

```typescript
// src/components/ChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';

export function ChatInterface() {
  const { currentSession, messages, loading, error, sendMessage, loadSessions, loadSession } = useChat();
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

  const parseSources = (metadata: string | null) => {
    if (!metadata) return [];
    try {
      const parsed = JSON.parse(metadata);
      return parsed.sources || [];
    } catch {
      return [];
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-icon">⭐</div>
        <div>
          <h2>AI Assistant</h2>
          <p>Always here to help</p>
        </div>
        <button className="close-btn">×</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>
              Hi! 👋 I'm your University AI Assistant. I can help answer questions 
              about admissions, scholarships, campus life, and more. Try asking me 
              something or click on an example below!
            </p>
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
              <button onClick={() => setInput("How do I access the career center?")}>
                How do I access the career center?
              </button>
              <button onClick={() => setInput("What are the housing options?")}>
                What are the housing options?
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
                Sources: {parseSources(message.metadata).map((s: any) => s.title).join(', ')}
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
          ➤
        </button>
      </form>
    </div>
  );
}
```

---

## 🎨 UI Design Reference

Based on the image provided, here's the UI structure:

```
┌─────────────────────────────────────┐
│ ⭐ AI Assistant          ×         │
│    Always here to help              │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Hi! 👋 I'm your University  │   │
│  │ AI Assistant...             │   │
│  │                             │   │
│  │ Try asking:                 │   │
│  │ [What are the admission...]│   │
│  │ [Tell me about scholarship..]│   │
│  │ [What clubs and...]         │   │
│  │ [How do I access...]        │   │
│  │ [What are the housing...]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ User message                │   │
│  │ 04:03 PM                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ AI response                 │   │
│  │ Sources: Document Title      │   │
│  │ 04:03 PM                    │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [Ask a question...]            [➤] │
└─────────────────────────────────────┘
```

---

## 📝 TypeScript Types

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
  university_id: number | null;
  created_at: string;
  updated_at: string;
}
```

---

## 🔄 Complete Flow Example

```typescript
// 1. Admin uploads document
const uploadResponse = await apiClient.post('/documents/upload', formData);
const documentId = uploadResponse.data.document.id;

// 2. Wait for processing (poll status)
let document;
do {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  const response = await apiClient.get(`/documents/${documentId}`);
  document = response.data;
} while (document.status === 'processing');

if (document.status !== 'processed') {
  throw new Error('Document processing failed');
}

// 3. User sends chat message
const chatResponse = await apiClient.post('/chat/message', {
  content: "What are the admission requirements?",
  session_id: null,
});

console.log('AI Response:', chatResponse.data.message.content);
console.log('Sources:', chatResponse.data.sources);

// 4. Continue conversation
const sessionId = chatResponse.data.session.id;
const response2 = await apiClient.post('/chat/message', {
  content: "What about scholarships?",
  session_id: sessionId,
});
```

---

## ⚠️ Important Notes

### 1. Document Processing
- Documents take 5-30 seconds to process
- Status: `uploaded` → `processing` → `processed`
- Only `processed` documents are searchable
- Check status before allowing chat

### 2. University Filtering
- **Automatic**: Backend handles all filtering
- Users only see documents from their university
- No manual filtering needed in frontend

### 3. Source Citations
- Always check `sources` array in response
- Sources show which documents were used
- Display sources to users for transparency

### 4. Error Handling
- If OpenAI API fails, shows error message
- If no documents found, AI still responds (without context)
- Handle 401 errors (token refresh)

### 5. Session Management
- Sessions are automatically created
- Sessions persist across page refreshes
- Load previous sessions on component mount

---

## 🎯 Quick Integration Checklist

- [ ] Set up API client with token management
- [ ] Create chat hook (`useChat`)
- [ ] Create chat component (`ChatInterface`)
- [ ] Handle document upload (admin)
- [ ] Handle chat messages
- [ ] Display source citations
- [ ] Handle loading states
- [ ] Handle errors gracefully
- [ ] Test with real documents
- [ ] Verify university filtering works

---

**Status:** ✅ Ready for Frontend Integration  
**All APIs:** ✅ Implemented and Tested  
**Documentation:** ✅ Complete

---

**Last Updated:** December 10, 2025

