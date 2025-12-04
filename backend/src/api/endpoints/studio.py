"""
Studio API endpoints.

This module contains endpoints for the Studio feature.
"""

from fastapi import APIRouter, HTTPException
from src.api.models import StudioRequest, StudioResponse
from src.studio.main import generate

router = APIRouter(prefix="/api/v1", tags=["studio"])


@router.post("/studio/generate", response_model=StudioResponse)
async def generate_studio_response(request: StudioRequest):
    """
    Generate a response for the Studio chatbot.
    
    Args:
        request: StudioRequest object containing user input, history, and optional file.
        
    Returns:
        StudioResponse object containing tool calls, text, or error.
    """
    try:
        # Prepare input data for the generate function
        input_data = {
            "user_input": request.user_input,
            "history": [item.model_dump() for item in request.history],
        }
        
        if request.file:
            input_data["file"] = request.file.model_dump()
            
        # Call the generate function
        response = generate(model=request.model_name, input_data=input_data)
        
        # Map response to StudioResponse
        return StudioResponse(**response)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
