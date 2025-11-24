#!/bin/bash

echo "=== Testing Solance API ==="

echo "1. Health Check:"
curl -s http://localhost:8000/health
echo -e "\n"

echo "2. Question Generation - First Time User:"
curl -s -X POST http://localhost:8000/api/v1/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "previous_questions": []
  }'
echo -e "\n"

echo "3. Question Generation - With History:"
curl -s -X POST http://localhost:8000/api/v1/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "previous_questions": [
      {
        "question": "Solve: 2x + 4 = 10",
        "score": 7,
        "mistakes": ["Division error in final step"]
      }
    ]
  }'
echo -e "\n"

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
echo -e "\n"

echo "=== API Testing Complete ==="