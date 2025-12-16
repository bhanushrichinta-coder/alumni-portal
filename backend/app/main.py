import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import create_tables
from app.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("Starting up Alumni Connect Hub API...")
    create_tables()
    print("Database tables created/verified.")
    
    # Load Knowledge Base documents on startup
    try:
        from app.services.knowledge_base import load_all_documents, get_knowledge_base_status
        doc_count = load_all_documents()
        status = get_knowledge_base_status()
        print(f"✓ Knowledge Base loaded: {doc_count} documents, {status['chunk_count']} chunks")
        print(f"  University: {status['university_name']} ({status['university_id']})")
    except Exception as e:
        print(f"⚠ Could not load Knowledge Base: {e}")
    
    # Auto-seed database if enabled and empty
    if os.getenv("AUTO_SEED", "false").lower() == "true":
        try:
            from app.core.database import SessionLocal
            from app.models.user import User
            db = SessionLocal()
            try:
                # Check if database is empty (no users)
                user_count = db.query(User).count()
                if user_count == 0:
                    print("Database is empty. Auto-seeding...")
                    # Import and run seed functions directly
                    import sys
                    import os as os_module
                    backend_dir = os_module.path.dirname(os_module.path.dirname(os_module.path.abspath(__file__)))
                    sys.path.insert(0, backend_dir)
                    from seed_data import main as seed_main
                    seed_main()
                    print("✓ Database seeded successfully")
                else:
                    print(f"Database already has {user_count} users. Skipping seed.")
            finally:
                db.close()
        except Exception as e:
            print(f"⚠ Could not auto-seed database: {e}")
            print("You may need to run 'python seed_data.py' manually")
    
    yield
    # Shutdown
    print("Shutting down...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Alumni Connect Hub - A comprehensive alumni networking platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Configure CORS - Allow all origins for simplicity (can be restricted in production)
# Using FastAPI's built-in CORSMiddleware which is well-tested and reliable
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins - simpler and more reliable
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Alumni Connect Hub API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": settings.APP_NAME}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

