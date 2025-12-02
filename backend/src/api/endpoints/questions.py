"""
Question generation API endpoints.

This module contains the POST /api/v1/generate-question endpoint
for generating personalized algebra questions.
"""

import json
from fastapi import APIRouter, HTTPException
from src.api.models import QuestionRequest, QuestionResponse, ErrorResponse
from src.question_generation.main import generate as generate_question

router = APIRouter(prefix="/api/v1", tags=["questions"])


@router.post("/generate-question", response_model=QuestionResponse)
async def generate_question_endpoint(request: QuestionRequest):
    """
    Generate a personalized question based on student performance history.
    
    Args:
        request: QuestionRequest containing model_name and previous_questions
        
    Returns:
        QuestionResponse containing the generated question
        
    Raises:
        HTTPException: For various error conditions (400, 500, 503)
    """
    try:
        # Prepare input JSON for the existing generate function
        if request.previous_questions:
            # Get the last question to save and use as context
            last_pq = request.previous_questions[-1]
            input_json = {
                "question": last_pq.question,
                "marks": last_pq.score,  # Map score to marks as expected by main.py
                "remarks": last_pq.remarks
            }
        else:
            # Handle empty previous_questions array for first-time users
            input_json = {}
        
        # Call the existing question generation function
        response_text = generate_question(request.model_name, input_json, request.user_id, request.subject_id)
        
        # Parse the JSON response
        response_data = json.loads(response_text)
        
        # Return the formatted response
        return QuestionResponse(question=response_data["question"], level=response_data["level"])
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse response from question generation service: {str(e)}"
        )
    except KeyError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid response format from question generation service: missing {str(e)}"
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
                detail=f"Internal server error: Question generation failed ({error_type})"
            )