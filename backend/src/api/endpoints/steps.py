"""
Steps generation API endpoints.

This module contains the POST /api/v1/generate-steps endpoint
for providing step-by-step guidance for algebra problems.
"""

import json
from typing import Union
from fastapi import APIRouter, HTTPException
from src.api.models import StepsRequest, StepResponse, FinalAnswerResponse, ErrorResponse
from src.steps_generation.main import generate as generate_steps

router = APIRouter(prefix="/api/v1", tags=["steps"])


@router.post("/generate-steps", response_model=Union[StepResponse, FinalAnswerResponse])
async def generate_steps_endpoint(request: StepsRequest):
    """
    Generate step-by-step guidance for algebra problems.
    
    Args:
        request: StepsRequest containing model_name, question, and optional conversation_history
        
    Returns:
        StepResponse for intermediate steps or FinalAnswerResponse for completed problems
        
    Raises:
        HTTPException: For various error conditions (400, 500, 503)
    """
    try:
        # Prepare input JSON for the existing generate function
        input_data = {
            "question": request.question
        }
        
        # Add conversation history if provided
        if request.conversation_history:
            conversation_history_data = []
            for step in request.conversation_history:
                conversation_history_data.append({
                    "step": step.step,
                    "your_prompt": step.your_prompt,
                    "student_answer": step.student_answer
                })
            input_data["conversation_history"] = conversation_history_data
        
        input_json = json.dumps(input_data)
        
        # Call the existing steps generation function
        response_data = generate_steps(request.model_name, input_json)
        
        # Parse the function call response and format according to API specification
        # The response_data should be a function call args object from Gemini
        
        # Handle different response formats from the existing module
        if hasattr(response_data, 'name'):
            # Response is a function call object
            function_name = response_data.name
            args = response_data
            
            if function_name == "step":
                # Return intermediate step response
                next_step = getattr(args, "next_step", "") or args.get("next_step", "")
                return StepResponse(
                    type="step",
                    next_step=next_step
                )
            elif function_name == "final_answer":
                # Return final answer response
                marks = getattr(args, "marks", 0) or args.get("marks", 0)
                tip = getattr(args, "tip", "") or args.get("tip", "")
                mistakes = getattr(args, "mistakes", []) or args.get("mistakes", [])
                
                # Convert empty list to None for API consistency
                mistakes_list = mistakes if mistakes else None
                
                return FinalAnswerResponse(
                    type="final_answer",
                    marks=marks,
                    tip=tip,
                    mistakes=mistakes_list
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Unknown function call type: {function_name}"
                )
        elif isinstance(response_data, dict):
            # Handle case where response_data is a dict
            if "next_step" in response_data:
                return StepResponse(
                    type="step",
                    next_step=response_data["next_step"]
                )
            elif "marks" in response_data:
                mistakes = response_data.get("mistakes", [])
                mistakes_list = mistakes if mistakes else None
                
                return FinalAnswerResponse(
                    type="final_answer",
                    marks=response_data["marks"],
                    tip=response_data.get("tip", ""),
                    mistakes=mistakes_list
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Invalid response format from steps generation service: missing required fields"
                )
        else:
            # Try to access attributes directly
            try:
                if hasattr(response_data, 'next_step'):
                    return StepResponse(
                        type="step",
                        next_step=response_data.next_step
                    )
                elif hasattr(response_data, 'marks'):
                    mistakes = getattr(response_data, 'mistakes', [])
                    mistakes_list = mistakes if mistakes else None
                    
                    return FinalAnswerResponse(
                        type="final_answer",
                        marks=response_data.marks,
                        tip=getattr(response_data, 'tip', ''),
                        mistakes=mistakes_list
                    )
                else:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Unrecognized response format from steps generation service: {type(response_data)}"
                    )
            except AttributeError as attr_error:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to parse response attributes: {str(attr_error)}"
                )
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse input or response JSON: {str(e)}"
        )
    except KeyError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid response format from steps generation service: missing {str(e)}"
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
                detail=f"Internal server error: Steps generation failed ({error_type})"
            )