"""
Test AI Chat Feature - Verify Groq and Hugging Face Integration
"""
import asyncio
import sys

# Fix Unicode encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from app.core.config import settings
from app.utils.embeddings import embedding_service, LANGCHAIN_AVAILABLE

async def test_embeddings():
    """Test Hugging Face embeddings"""
    print("\n🧪 Testing Embeddings (Hugging Face)")
    print("=" * 60)
    
    if not LANGCHAIN_AVAILABLE:
        print("❌ LangChain not available")
        return False
    
    if not settings.HUGGINGFACE_API_KEY and not settings.USE_LOCAL_EMBEDDINGS:
        print("⚠️  Hugging Face API key not set and local embeddings disabled")
        print("   Set HUGGINGFACE_API_KEY in .env or USE_LOCAL_EMBEDDINGS=True")
        return False
    
    try:
        test_text = "This is a test document for the alumni portal."
        embedding = await embedding_service.generate_embedding(test_text)
        
        if embedding:
            print(f"✅ Embedding generated successfully!")
            print(f"   Dimension: {len(embedding)}")
            print(f"   First 5 values: {embedding[:5]}")
            return True
        else:
            print("❌ Failed to generate embedding")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

async def test_groq_chat():
    """Test Groq chat"""
    print("\n🧪 Testing Chat (Groq)")
    print("=" * 60)
    
    if not LANGCHAIN_AVAILABLE:
        print("❌ LangChain not available")
        return False
    
    # Check if Groq is available
    try:
        from langchain_groq import ChatGroq
        from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
    except Exception as e:
        print(f"❌ Cannot import Groq: {str(e)}")
        return False
    
    if not settings.GROQ_API_KEY:
        print("⚠️  GROQ_API_KEY not set in .env")
        print("   Get free API key at: https://console.groq.com/keys")
        return False
    
    try:
        # Use updated model name (llama-3.3-70b-versatile instead of deprecated llama-3.1-70b-versatile)
        model_name = settings.GROQ_MODEL
        if model_name == "llama-3.1-70b-versatile":
            print("⚠️  Warning: Using deprecated model. Updating to llama-3.3-70b-versatile")
            model_name = "llama-3.3-70b-versatile"
        
        # Initialize Groq
        llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=model_name,
            temperature=0.7,
            max_tokens=100
        )
        
        # Create simple prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful assistant. Respond briefly."),
            ("human", "Say 'AI chat is working!' if you can read this.")
        ])
        
        chain = prompt | llm
        response = chain.invoke({})
        
        print(f"✅ Groq chat working!")
        print(f"   Response: {response.content[:100]}")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        if "API key" in str(e).lower() or "unauthorized" in str(e).lower():
            print("   Check your GROQ_API_KEY in .env")
        return False

async def main():
    """Run all AI tests"""
    print("\n" + "=" * 60)
    print("🤖 AI CHAT FEATURE TEST")
    print("=" * 60)
    
    # Test LangChain availability
    print(f"\n📦 LangChain Status: {'✅ Available' if LANGCHAIN_AVAILABLE else '❌ Not Available'}")
    
    # Test embeddings
    embeddings_ok = await test_embeddings()
    
    # Test chat
    chat_ok = await test_groq_chat()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"LangChain: {'✅' if LANGCHAIN_AVAILABLE else '❌'}")
    print(f"Embeddings: {'✅' if embeddings_ok else '❌'}")
    print(f"Chat (Groq): {'✅' if chat_ok else '❌'}")
    
    if LANGCHAIN_AVAILABLE and embeddings_ok and chat_ok:
        print("\n🎉 All AI features are working!")
        return 0
    else:
        print("\n⚠️  Some features need configuration:")
        if not embeddings_ok:
            print("   • Set HUGGINGFACE_API_KEY or USE_LOCAL_EMBEDDINGS=True")
        if not chat_ok:
            print("   • Set GROQ_API_KEY in .env")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

