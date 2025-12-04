#!/bin/bash

# Load API Key from .env
API_KEY="123aosbbilep8975451248hsubns"

API_URL="http://localhost:8080/api/v1/studio/generate"


echo "Testing Studio API..."
echo "API URL: $API_URL"
echo "API Key: $API_KEY"

# Test 1: Initial Chat
echo -e "\n--- Test 1: Initial Chat ---"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "model_name": "gemini-2.5-pro",
    "user_input": "I want to learn about Quantum Physics.",
    "history": []
  }'

# Test 2: Follow-up Chat (Simulated)
echo -e "\n\n--- Test 2: Follow-up Chat ---"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "model_name": "gemini-2.5-pro",
    "user_input": "I am a complete beginner.",
    "history": [
      {
        "user": "I want to learn about Quantum Physics.",
        "model": "What is your current level?"
      }
    ]
  }'

# Test 3: File Upload
echo -e "\n\n--- Test 3: File Upload ---"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "model_name": "gemini-2.5-pro",
    "user_input": "Create a course from this file.",
    "history": [],
    "file": {
      "uri": "https://generativelanguage.googleapis.com/v1beta/files/example-file-uri",
      "mime_type": "application/pdf"
    }
  }'

echo -e "\n\nDone."
