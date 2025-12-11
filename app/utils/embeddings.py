"""
Embedding generation utilities using LangChain with Hugging Face (FREE)
Supports both API-based and local embeddings
"""
from typing import List, Optional
from app.core.config import settings
from app.core.logging import logger

# Optional LangChain imports - handle import errors gracefully
# Catch all exceptions since LangChain may have compatibility issues
try:
    from langchain_community.embeddings import HuggingFaceEmbeddings, HuggingFaceInferenceAPIEmbeddings
    LANGCHAIN_AVAILABLE = True
except Exception as e:
    # Log warning but don't fail - server can start without LangChain
    import sys
    if hasattr(sys, 'stderr'):
        print(f"Warning: LangChain not available: {str(e)}. Embeddings will not work.", file=sys.stderr)
    HuggingFaceEmbeddings = None
    HuggingFaceInferenceAPIEmbeddings = None
    LANGCHAIN_AVAILABLE = False


class CustomHuggingFaceEmbeddings:
    """Custom wrapper for Hugging Face Inference API embeddings to fix response format issues"""
    
    def __init__(self, api_key: str, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.api_key = api_key
        self.model_name = model_name
        # Try different endpoint formats - Hugging Face API has changed
        # Option 1: Direct model endpoint
        self.api_url = f"https://api-inference.huggingface.co/models/{model_name}"
        # Option 2: Feature extraction endpoint (deprecated but might work for some models)
        self.api_url_alt = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{model_name}"
    
    def embed_query(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        import httpx
        try:
            # Try the main endpoint first
            response = httpx.post(
                self.api_url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"inputs": text},
                timeout=30.0
            )
            
            # If 410 Gone (deprecated), try alternative endpoint
            if response.status_code == 410:
                logger.warning("Main endpoint deprecated, trying alternative...")
                response = httpx.post(
                    self.api_url_alt,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={"inputs": text},
                    timeout=30.0
                )
            
            # Handle 503 (model loading) - wait and retry
            if response.status_code == 503:
                import time
                logger.info("Model is loading, waiting 10 seconds...")
                time.sleep(10)
                response = httpx.post(
                    self.api_url,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={"inputs": text},
                    timeout=30.0
                )
            
            # If still 410, the free Inference API for embeddings is not available
            if response.status_code == 410:
                raise ValueError(
                    "Hugging Face Inference API for embeddings is deprecated. "
                    "Please use USE_LOCAL_EMBEDDINGS=True in .env file, or use a different embedding service."
                )
            
            response.raise_for_status()
            result = response.json()
            
            # Handle different response formats from Hugging Face API
            if isinstance(result, list):
                # If it's a list of lists, flatten or take first
                if len(result) > 0:
                    embedding = result[0]
                    if isinstance(embedding, list):
                        return embedding
                    # If it's a single value, wrap it
                    return [embedding] if isinstance(embedding, (int, float)) else list(embedding)
                return result
            elif isinstance(result, dict):
                # Check for common response formats
                if "embedding" in result:
                    return result["embedding"]
                elif "output" in result:
                    output = result["output"]
                    if isinstance(output, list) and len(output) > 0:
                        return output[0] if isinstance(output[0], list) else output
                elif len(result) == 1:
                    # Single key dict, return its value
                    value = list(result.values())[0]
                    if isinstance(value, list):
                        return value[0] if len(value) > 0 and not isinstance(value[0], list) else value
                    return value if isinstance(value, list) else [value]
                else:
                    raise ValueError(f"Unexpected response format: {type(result)}, keys: {result.keys() if isinstance(result, dict) else 'N/A'}")
            else:
                # Direct array/list
                if isinstance(result, (list, tuple)):
                    return list(result)
                raise ValueError(f"Unexpected response type: {type(result)}")
        except Exception as e:
            logger.error(f"Hugging Face API error: {str(e)}")
            raise
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        import httpx
        try:
            response = httpx.post(
                self.api_url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"inputs": texts},
                timeout=30.0
            )
            response.raise_for_status()
            result = response.json()
            
            # Handle response format
            if isinstance(result, list):
                embeddings = []
                for item in result:
                    if isinstance(item, list):
                        embeddings.append(item)
                    elif isinstance(item, (int, float)):
                        # Single value, wrap in list
                        embeddings.append([item])
                    else:
                        embeddings.append(list(item) if hasattr(item, '__iter__') else [item])
                return embeddings
            else:
                raise ValueError(f"Unexpected response format: {type(result)}")
        except Exception as e:
            logger.error(f"Hugging Face API batch error: {str(e)}")
            raise


class EmbeddingService:
    """Service for generating embeddings using LangChain + Hugging Face"""

    def __init__(self):
        self.embeddings = None
        self._initialize_embeddings()

    def _initialize_embeddings(self):
        """Initialize embedding model based on configuration"""
        if not LANGCHAIN_AVAILABLE:
            logger.error("LangChain is not available. Cannot initialize embeddings.")
            self.embeddings = None
            return
        
        try:
            if settings.USE_LOCAL_EMBEDDINGS:
                # Use local sentence-transformers (no API key needed, runs on your machine)
                logger.info(f"Initializing local embeddings: {settings.HUGGINGFACE_EMBEDDING_MODEL}")
                self.embeddings = HuggingFaceEmbeddings(
                    model_name=settings.HUGGINGFACE_EMBEDDING_MODEL,
                    model_kwargs={'device': 'cpu'},  # Use 'cuda' if you have GPU
                    encode_kwargs={'normalize_embeddings': True}
                )
                logger.info("✅ Local embeddings initialized successfully")
            elif settings.HUGGINGFACE_API_KEY:
                # Use Hugging Face Inference API (FREE with API key)
                logger.info(f"Initializing Hugging Face API embeddings: {settings.HUGGINGFACE_EMBEDDING_MODEL}")
                # Create custom wrapper to handle API response format
                self.embeddings = CustomHuggingFaceEmbeddings(
                    api_key=settings.HUGGINGFACE_API_KEY,
                    model_name=settings.HUGGINGFACE_EMBEDDING_MODEL
                )
                logger.info("✅ Hugging Face API embeddings initialized successfully")
            else:
                logger.warning("⚠️ No embedding service configured. Set HUGGINGFACE_API_KEY or USE_LOCAL_EMBEDDINGS=True")
        except Exception as e:
            logger.error(f"Error initializing embeddings: {str(e)}")
            self.embeddings = None

    async def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding for a single text"""
        if not self.embeddings:
            logger.error("Embedding service not initialized")
            return None

        try:
            # LangChain embeddings are synchronous, but we're in async context
            # Use asyncio to run in thread pool
            import asyncio
            loop = asyncio.get_event_loop()
            
            def _embed():
                try:
                    result = self.embeddings.embed_query(text)
                    if result is None:
                        raise ValueError("Embedding API returned None")
                    if not isinstance(result, list):
                        raise ValueError(f"Expected list, got {type(result)}")
                    if len(result) == 0:
                        raise ValueError("Embedding list is empty")
                    return result
                except Exception as e:
                    logger.error(f"Embedding API error details: {type(e).__name__}: {str(e)}")
                    raise
            
            embedding = await loop.run_in_executor(None, _embed)
            return embedding
        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            logger.error(f"Error generating embedding: {error_msg}")
            return None

    async def generate_embeddings_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Generate embeddings for multiple texts"""
        if not self.embeddings:
            logger.error("Embedding service not initialized")
            return [None] * len(texts)

        try:
            import asyncio
            loop = asyncio.get_event_loop()
            embeddings = await loop.run_in_executor(
                None,
                lambda: self.embeddings.embed_documents(texts)
            )
            return embeddings
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {str(e)}")
            return [None] * len(texts)

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into chunks with overlap"""
        if len(text) <= chunk_size:
            return [text]

        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - overlap

        return chunks


# Global instance
embedding_service = EmbeddingService()
