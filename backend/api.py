"""
Solance API - FastAPI application for personalized AI tutoring system.

This module provides REST endpoints for question generation and steps generation
functionality, integrating with existing AI-powered tutoring backend modules.
"""

# ADDED: Depends, status
from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
# ADDED: APIKeyHeader
from fastapi.security import APIKeyHeader 
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- SECURITY CONFIGURATION ---
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
expected_api_key = os.getenv("INTERNAL_API_KEY")

async def verify_api_key(api_key: str = Depends(api_key_header)):
    # If the environment variable isn't set, we shouldn't allow access (fail safe)
    if not expected_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Server security configuration error: INTERNAL_API_KEY not set"
        )
        
    if api_key != expected_api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing API Key"
        )
    return api_key
# -----------------------------

# Create FastAPI application instance
# REMOVED: dependencies=[Depends(verify_api_key)] from here
# We don't want to lock the /health endpoint!
app = FastAPI(
    title="Solance API",
    description="REST API for personalized AI tutoring system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Make sure to update this with your actual Vercel URL later!
    allow_origins=[
        "http://localhost:3000",           # For local testing
        "https://solance-kiro.vercel.app" # Your actual deployed frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "ValidationError",
            "detail": f"Request validation failed: {str(exc)}"
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": f"HTTP{exc.status_code}Error",
            "detail": exc.detail
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "detail": "An unexpected error occurred. Please try again later."
        }
    )

# --- PUBLIC ENDPOINTS (No API Key needed) ---
@app.get("/")
async def root():
    return {"message": "Solance API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "solance-api"}


# --- PROTECTED ENDPOINTS (API Key required) ---
from src.api.endpoints.questions import router as questions_router
from src.api.endpoints.steps import router as steps_router
from src.api.endpoints.subjects import router as subjects_router

# We add the dependency here!
# This protects /questions, /steps, and /subjects, but leaves /health open.
protected_deps = [Depends(verify_api_key)]

app.include_router(questions_router, dependencies=protected_deps)
app.include_router(steps_router, dependencies=protected_deps)
app.include_router(subjects_router, dependencies=protected_deps)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)