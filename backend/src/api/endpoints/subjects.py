"""
Subject API endpoints.

This module contains endpoints for fetching and creating subjects.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Query
from src.api.models import Subject, SubjectCreate
from src.database.subjects_retrieve_api import fetch_cartridge
from src.database.subject_insert_api import insert_module

router = APIRouter(prefix="/api/v1", tags=["subjects"])


@router.get("/subjects", response_model=List[Subject])
async def get_subjects(user_id: str = Query(..., description="User ID to fetch subjects for")):
    """
    Fetch subjects for a given user.
    
    Returns subjects that are either:
    - Public (payload.meta.public == true)
    - Created by the user (payload.meta.created_by == user_id)
    
    Args:
        user_id: User ID to filter subjects
        
    Returns:
        List of Subject objects
        
    Raises:
        HTTPException: For various error conditions (400, 500)
    """
    try:
        subjects = fetch_cartridge(user_id)
        return subjects
    except Exception as e:
        error_message = str(e)
        
        # Handle database connection errors
        if "connection" in error_message.lower() or "network" in error_message.lower():
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable: Database connection error"
            )
        
        # Generic server error
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: Failed to fetch subjects ({type(e).__name__})"
        )


@router.post("/subjects", response_model=dict)
async def create_subject(subject: SubjectCreate):
    """
    Create a new subject in the database.
    
    Args:
        subject: SubjectCreate object containing meta and curriculum data
        
    Returns:
        Dictionary containing subject_id and success message
        
    Raises:
        HTTPException: For various error conditions (400, 500)
    """
    try:
        # Convert Pydantic model to dict
        module_json = subject.model_dump()
        
        # Insert into database
        inserted_row, subject_id = insert_module(module_json)
        
        return {
            "subject_id": subject_id,
            "message": "Subject created successfully",
            "data": inserted_row
        }
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input: {str(e)}"
        )
    except Exception as e:
        error_message = str(e)
        
        # Handle permission/RLS errors
        if "permission" in error_message.lower() or "rls" in error_message.lower() or "row-level security" in error_message.lower():
            raise HTTPException(
                status_code=403,
                detail="Permission denied: Unable to create subject due to database permissions"
            )
        
        # Handle database connection errors
        if "connection" in error_message.lower() or "network" in error_message.lower():
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable: Database connection error"
            )
        
        # Generic server error
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: Failed to create subject ({type(e).__name__})"
        )
