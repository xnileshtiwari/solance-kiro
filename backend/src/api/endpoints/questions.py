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
    Generate a personalized algebra question based on student performance history.
    
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
            # Convert previous questions to the format expected by the existing module
            previous_questions_data = []
            for pq in request.previous_questions:
                previous_questions_data.append({
                    "question": pq.question,
                    "score": pq.score,
                    "mistakes": pq.mistakes
                })
            
            input_data = {
                "previous_questions": previous_questions_data
            }
            input_json = json.dumps(input_data)
        else:
            # Handle empty previous_questions array for first-time users
            input_json = "no data"
        
        # Call the existing question generation function
        response_text = generate_question(request.model_name, input_json)
        
        # Parse the JSON response
        response_data = json.loads(response_text)
        
        # Return the formatted response
        return QuestionResponse(question=response_data["question"])
        
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