"""
Solance API - FastAPI application for personalized AI tutoring system.

This module provides REST endpoints for question generation and steps generation
functionality, integrating with existing AI-powered tutoring backend modules.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI application instance
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
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handlers for comprehensive error handling
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors (422) with detailed error messages."""
    return JSONResponse(
        status_code=422,
        content={
            "error": "ValidationError",
            "detail": f"Request validation failed: {str(exc)}"
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent error format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": f"HTTP{exc.status_code}Error",
            "detail": exc.detail
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions with generic error response."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "detail": "An unexpected error occurred. Please try again later."
        }
    )

@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {"message": "Solance API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "solance-api"}

# Import and include API endpoints
from src.api.endpoints.questions import router as questions_router
from src.api.endpoints.steps import router as steps_router
from src.api.endpoints.subjects import router as subjects_router

# Include API endpoints
app.include_router(questions_router)
app.include_router(steps_router)
app.include_router(subjects_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
