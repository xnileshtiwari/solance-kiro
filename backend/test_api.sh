#!/bin/bash

echo "=== Testing Solance API ==="

echo "1. Health Check:"
curl -s http://localhost:8000/health
echo -e "\n"

echo "2. Question Generation - First Time User:"


curl -X POST "http://localhost:8000/api/v1/generate-question" \
     -H "Content-Type: application/json" \
     -d '{
           "model_name": "gemini-2.5-flash",
           "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
           "subject_id": "wtle4d",
           "previous_questions": []
         }'
         

curl -s -X POST http://localhost:8000/api/v1/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "subject_id": "wtle4d",
    "previous_questions": [
      {
        "question": "Solve: 2x + 4 = 10",
        "score": 7,
        "remarks": ["Division error in final step"]
      }
    ]
  }'







echo "3. Question Generation - With History:"


curl -s -X POST http://localhost:8000/api/v1/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "subject_id": "wtle4d",
    "previous_questions": [
      {
        "question": "Solve: 2x + 4 = 10",
        "score": 7,
        "remarks": ["Division error in final step"]
      }
    ]
  }'





echo "4. Steps Generation - Initial Step:"
curl -s -X POST http://localhost:8000/api/v1/generate-steps \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "question": "Solve for x: 2x + 4 = 10"
  }'
echo -e "\n"





echo "5. Steps Generation - With Conversation History:"
curl -s -X POST http://localhost:8000/api/v1/generate-steps \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "question": "Solve for x: 2x + 4 = 10",
    "conversation_history": [
      {
        "step": 1,
        "your_prompt": "Move +4 to the other side. What is 2x = ?",
        "student_answer": "6"
      }
    ]
  }'



curl -X POST "http://localhost:8000/api/v1/subjects" \
  -H "Content-Type: application/json" \
  -d '{
    "meta": {
      "display_name": "Advanced Algebra",
      "subject": "mathematics",
      "description": "Advanced algebraic concepts including quadratic equations and polynomials",
      "created_by": "user_nilesh123",
      "public": false
    },
    "curriculum": [
      {
        "level": 1,
        "name": "Basic Equations",
        "concepts": ["Linear equations", "Simple factoring"],
        "question_style": "Multiple Choice"
      },
      {
        "level": 2,
        "name": "Quadratic Equations",
        "concepts": ["Quadratic formula", "Completing the square"],
        "question_style": "Problem Solving"
      }
    ]
  }'




curl -X GET "http://localhost:8000/api/v1/subjects?user_id=YOUR_USER_ID"