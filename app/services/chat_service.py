"""
Chat service for AI-powered Q&A with RAG
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from datetime import datetime, timezone
from sqlalchemy import select
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatMessageCreate, ChatResponse, ChatSessionResponse
from app.utils.embeddings import embedding_service
from app.utils.vector_db import vector_db_service
from app.repositories.document_repository import DocumentRepository
from app.core.config import settings
from app.core.logging import logger

# Optional LangChain imports - handle import errors gracefully
# Catch all exceptions since LangChain may have compatibility issues
try:
    from langchain_groq import ChatGroq
    from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
    LANGCHAIN_AVAILABLE = True
except Exception as e:
    # Log warning but don't fail - server can start without LangChain
    import sys
    if hasattr(sys, 'stderr'):
        print(f"Warning: LangChain not available: {str(e)}. Chat features will be limited.", file=sys.stderr)
    ChatGroq = None
    ChatPromptTemplate = None
    SystemMessagePromptTemplate = None
    HumanMessagePromptTemplate = None
    LANGCHAIN_AVAILABLE = False


class ChatService:
    """Service for chat operations with RAG"""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.document_repo = DocumentRepository(session)

    async def create_session(self, user_id: int, title: Optional[str] = None) -> ChatSession:
        """Create new chat session"""
        session = ChatSession(
            user_id=user_id,
            title=title or f"Chat {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"
        )
        self.session.add(session)
        await self.session.commit()
        await self.session.refresh(session)
        return session

    async def get_session(self, session_id: int, user_id: int) -> Optional[ChatSession]:
        """Get chat session"""
        result = await self.session.execute(
            select(ChatSession).where(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def list_sessions(self, user_id: int, skip: int = 0, limit: int = 50) -> List[ChatSession]:
        """List user's chat sessions"""
        result = await self.session.execute(
            select(ChatSession)
            .where(ChatSession.user_id == user_id)
            .order_by(ChatSession.last_message_at.desc(), ChatSession.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def send_message(self, message_data: ChatMessageCreate, user_id: int) -> ChatResponse:
        """Send message and get AI response with RAG"""
        # Get or create session
        if message_data.session_id:
            session = await self.get_session(message_data.session_id, user_id)
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Chat session not found"
                )
        else:
            session = await self.create_session(user_id)

        # Save user message
        user_message = ChatMessage(
            session_id=session.id,
            role="user",
            content=message_data.content
        )
        self.session.add(user_message)
        await self.session.flush()

        # Get user's university_id for filtering documents
        from app.repositories.user_repository import UserRepository
        user_repo = UserRepository(self.session)
        user = await user_repo.get_by_id(user_id)
        university_id = user.university_id if user else None
        
        # Perform RAG: search relevant documents filtered by university
        query_embedding = await embedding_service.generate_embedding(message_data.content)
        filter_metadata = {}
        if university_id:
            # Filter by user's university - users can only chat about their university's documents
            filter_metadata["university_id"] = str(university_id)
        
        if query_embedding:
            search_results = vector_db_service.search(
                query_embedding=query_embedding,
                n_results=5,
                filter_metadata=filter_metadata if filter_metadata else None
            )
        else:
            search_results = []

        # Build context from search results
        context = ""
        sources = []
        for result in search_results:
            context += f"\n\n{result['document']}\n"
            sources.append({
                "document_id": result['metadata'].get('document_id'),
                "chunk_index": result['metadata'].get('chunk_index'),
                "title": result['metadata'].get('title', 'Unknown')
            })

        # Generate AI response using LangChain + Groq (FREE)
        assistant_content = await self._generate_response(message_data.content, context)

        # Save assistant message
        assistant_message = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=assistant_content,
            metadata=str({"sources": sources}) if sources else None
        )
        self.session.add(assistant_message)

        # Update session
        session.last_message_at = datetime.now(timezone.utc)
        await self.session.commit()
        await self.session.refresh(assistant_message)
        await self.session.refresh(session)

        return ChatResponse(
            message=assistant_message,
            session=session,
            sources=sources if sources else None
        )

    async def _generate_response(self, query: str, context: str) -> str:
        """Generate AI response using LangChain + Groq (FREE)"""
        if not LANGCHAIN_AVAILABLE:
            return "I'm sorry, but the AI service is not available. LangChain dependencies are not properly installed."
        
        if not settings.GROQ_API_KEY:
            return "I'm sorry, but the AI service is not configured. Please add GROQ_API_KEY to your .env file."

        try:
            # Initialize Groq chat model (FREE)
            llm = ChatGroq(
                groq_api_key=settings.GROQ_API_KEY,
                model_name=settings.GROQ_MODEL,
                temperature=0.7,
                max_tokens=500
            )

            # Create prompt template using LangChain
            system_prompt = """You are a helpful AI assistant for a university alumni portal. 
Answer questions based on the provided context from university documents. 
If the context doesn't contain relevant information, say so politely.
Always cite sources when possible.
Be friendly, professional, and helpful. Focus on providing accurate information from the documents."""

            prompt = ChatPromptTemplate.from_messages([
                SystemMessagePromptTemplate.from_template(system_prompt),
                HumanMessagePromptTemplate.from_template(
                    "Context:\n{context}\n\nQuestion: {query}"
                )
            ])

            # Format and invoke the chain
            chain = prompt | llm
            
            # Run in executor since LangChain is synchronous
            import asyncio
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: chain.invoke({"context": context, "query": query})
            )

            return response.content
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return "I'm sorry, I encountered an error while generating a response. Please try again."

    async def get_session_messages(self, session_id: int, user_id: int) -> List[ChatMessage]:
        """Get all messages in a session"""
        session = await self.get_session(session_id, user_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )

        result = await self.session.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
        )
        return list(result.scalars().all())


