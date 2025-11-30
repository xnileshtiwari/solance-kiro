"""
Pydantic models for request/response validation.

This module contains all the data models used for API request
and response validation.
"""

from typing import List, Optional
from pydantic import BaseModel


# Task 2.1: Request models for question generation endpoint
class PreviousQuestion(BaseModel):
    """Model for previous question data used in personalization."""
    question: str
    score: int
    remarks: List[str]


class QuestionRequest(BaseModel):
    """Request model for question generation endpoint."""
    model_name: str
    previous_questions: List[PreviousQuestion] = []


# Task 2.2: Request models for steps generation endpoint
class ConversationStep(BaseModel):
    """Model for conversation step in tutoring interaction."""
    step: int
    your_prompt: str
    student_answer: str


class StepsRequest(BaseModel):
    """Request model for steps generation endpoint."""
    model_name: str
    question: str
    conversation_history: Optional[List[ConversationStep]] = None
    student_answer: Optional[str] = None


# Task 2.3: Response models for API outputs
class QuestionResponse(BaseModel):
    """Response model for question generation endpoint."""
    question: str


class StepResponse(BaseModel):
    """Response model for intermediate step in steps generation."""
    type: str = "step"
    next_step: str


class FinalAnswerResponse(BaseModel):
    """Response model for final answer in steps generation."""
    type: str = "final_answer"
    marks: int
    tip: str
    remarks: Optional[List[str]]


class ErrorResponse(BaseModel):
    """Response model for API errors."""
    error: str
    detail: str