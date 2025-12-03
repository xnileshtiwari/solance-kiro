"""
Grading API endpoints.

This module contains the POST /api/v1/grade-answer endpoint
for grading student answers.
"""

import json
from fastapi import APIRouter, HTTPException
from src.api.models import GradingRequest, GradingResponse, ErrorResponse
from src.solo_mode.main import generate as grade_answer

router = APIRouter(prefix="/api/v1", tags=["grading"])


@router.post("/grade-answer", response_model=GradingResponse)
async def grade_answer_endpoint(request: GradingRequest):
    """
    Grade a student's answer to a question.
    
    Args:
        request: GradingRequest containing model_name, question, and student_answer
        
    Returns:
        GradingResponse containing marks, correction, and remarks
        
    Raises:
        HTTPException: For various error conditions (400, 500, 503)
    """
    try:
        # Prepare input JSON for the grading function
        input_json = json.dumps({
            "question": request.question,
            "student_answer": request.student_answer
        })
        
        # Call the grading function
        response_data = grade_answer(request.model_name, input_json)
        
        # The response_data is already a dict from the function_call.args
        # Extract the required fields
        return GradingResponse(
            marks=response_data["marks"],
            correction=response_data["correction"],
            remarks=response_data["remarks"]
        )
        
    except KeyError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid response format from grading service: missing {str(e)}"
        )
    except Exception as e:
        # Handle Gemini API failures and other unexpected errors
        error_message = str(e)
        error_type = type(e).__name__
        
        # Check for common Gemini API error patterns
        if "api_key" in error_message.lower() or "authentication" in error_message.lower():
            raise HTTPException(
                status_code=500,
                detail="Authentication error: Invalid or missing Google API key"
            )
        elif "quota" in error_message.lower() or "rate limit" in error_message.lower():
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable: API quota exceeded or rate limited"
            )
        elif "network" in error_message.lower() or "connection" in error_message.lower():
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable: Network connection error"
            )
        elif "timeout" in error_message.lower():
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable: Request timeout"
            )
        elif "unavailable" in error_message.lower() or "service" in error_message.lower():
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable: Gemini API is currently unavailable"
            )
        else:
            # Generic server error for other cases
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: Grading failed ({error_type})"
            )
