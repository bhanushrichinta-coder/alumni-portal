"""
FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.logging import logger
from app.api.v1 import auth, users, documents, chat, events, jobs, alumni, feed, document_requests
from app.db.init_db import init_db
from pathlib import Path

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup: Initialize database
    logger.info("Initializing database...")
    try:
        init_db()
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Error during database initialization: {str(e)}")
        # Don't fail startup if init_db fails (might already be initialized)
    
    yield
    
    # Shutdown: Cleanup if needed
    logger.info("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Alumni Portal Backend API with AI-powered features",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
# Handle wildcard origin for development/production
cors_origins = settings.CORS_ORIGINS

# Check if we should allow all origins
allow_all = False
if isinstance(cors_origins, list):
    if len(cors_origins) == 1 and cors_origins[0] == "*":
        allow_all = True
elif isinstance(cors_origins, str) and cors_origins == "*":
    allow_all = True

if allow_all:
    # Allow all origins (for development or when frontend domain is unknown)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,  # Cannot use credentials with wildcard
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
else:
    # Specific origins (production)
    origins_list = cors_origins if isinstance(cors_origins, list) else [cors_origins]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins_list,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
    )


# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(alumni.router, prefix=settings.API_V1_STR)
app.include_router(feed.router, prefix=settings.API_V1_STR)
app.include_router(document_requests.router, prefix=settings.API_V1_STR)

# Mount static files for media serving
from pathlib import Path
upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(upload_dir)), name="media")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

