# Design Document

## Overview

The Solance API will be built using FastAPI to provide REST endpoints for the existing question generation and steps generation functionality. The API will serve as a bridge between the frontend application and the AI-powered tutoring backend, handling request validation, response formatting, and error management while leveraging the existing Gemini AI integration.

## Architecture

The API follows a layered architecture pattern:

1. **API Layer (FastAPI)**: Handles HTTP requests, validation, and response formatting
2. **Service Layer**: Integrates with existing generation modules and handles business logic
3. **Integration Layer**: Existing question_generation and steps_generation modules
4. **External Services**: Google Gemini AI API

```
Frontend → FastAPI Endpoints → Service Functions → Existing Modules → Gemini API
```

## Components and Interfaces

### API Endpoints

#### Question Generation Endpoint
- **Path**: `POST /api/v1/generate-question`
- **Request Body**:
  ```json
  {
    "model_name": "gemini-2.5-flash",
    "previous_questions": [
      {
        "question": "Solve: 2x + 4 = 10",
        "score": 7,
        "mistakes": ["Division error in final step"]
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "question": "Solve for x: 3x - 7 = 11"
  }
  ```

#### Steps Generation Endpoint
- **Path**: `POST /api/v1/generate-steps`
- **Request Body** (First step):
  ```json
  {
    "model_name": "gemini-3-pro-preview",
    "question": "Solve for x: 2x + 4 = 10"
  }
  ```
- **Request Body** (Subsequent steps):
  ```json
  {
    "model_name": "gemini-3-pro-preview", 
    "question": "Solve for x: 2x + 4 = 10",
    "conversation_history": [
      {
        "step": 1,
        "your_prompt": "Move +4 to the other side. What is 2x = ?",
        "student_answer": "6"
      }
    ]
  }
  ```

### Service Integration

The API will import and utilize existing functions:
- `from src.question_generation.main import generate as generate_question`
- `from src.steps_generation.main import generate as generate_steps`

### Request/Response Models

Using Pydantic models for validation:

```python
class PreviousQuestion(BaseModel):
    question: str
    score: int
    mistakes: List[str]

class QuestionRequest(BaseModel):
    model_name: str
    previous_questions: List[PreviousQuestion] = []

class ConversationStep(BaseModel):
    step: int
    your_prompt: str
    student_answer: str

class StepsRequest(BaseModel):
    model_name: str
    question: str
    conversation_history: Optional[List[ConversationStep]] = None
```

## Data Models

### Input Data Models

**Question Generation Input**:
- `model_name`: String (required) - Gemini model identifier
- `previous_questions`: Array (optional) - Student's question history

**Steps Generation Input**:
- `model_name`: String (required) - Gemini model identifier  
- `question`: String (required) - The algebra problem to solve
- `conversation_history`: Array (optional) - Previous interaction steps

### Output Data Models

**Question Generation Output**:
- `question`: String - Generated algebra problem

**Steps Generation Output** (Intermediate):
- `type`: "step"
- `next_step`: String - Next guidance instruction

**Steps Generation Output** (Final):
- `type`: "final_answer"
- `marks`: Integer (0-10) - Student's score
- `tip`: String - Personalized feedback
- `mistakes`: Array of strings or null - List of errors made

## Error Handling

### Error Response Format
```json
{
  "error": "ValidationError",
  "detail": "Missing required field: model_name"
}
```

### Error Categories
1. **Validation Errors (400)**: Invalid input format, missing fields
2. **Authentication Errors (401)**: Missing or invalid API keys
3. **Not Found Errors (404)**: Invalid endpoints
4. **Unprocessable Entity (422)**: Valid JSON but invalid data types
5. **Internal Server Errors (500)**: Gemini API failures, unexpected exceptions
6. **Service Unavailable (503)**: External service downtime

### Error Handling Strategy
- Catch and wrap exceptions from existing modules
- Provide meaningful error messages without exposing internal details
- Log errors for debugging while returning user-friendly responses
- Implement retry logic for transient Gemini API failures

## Testing Strategy

The testing approach will use both unit testing and property-based testing to ensure API reliability and correctness.

**Unit Testing Framework**: pytest with FastAPI TestClient
**Property-Based Testing Framework**: Hypothesis

### Unit Testing Coverage
- API endpoint response formats
- Request validation logic
- Error handling scenarios
- Integration with existing modules
- Mock external API calls for isolated testing

### Property-Based Testing
Property-based tests will verify universal behaviors across different inputs using Hypothesis to generate test data. Each property-based test will run a minimum of 100 iterations and be tagged with comments referencing the corresponding correctness property.

**Property Test Configuration**: Each test will use `@given` decorators with appropriate strategies and `@settings(max_examples=100)` to ensure comprehensive coverage.

**Property Test Tagging Format**: Each property-based test will include a comment with the exact format: `**Feature: solance-api, Property {number}: {property_text}**`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Valid question generation requests return proper JSON format
*For any* valid POST request to the question generation endpoint with model name and previous questions data, the API response should contain a JSON object with a "question" field containing a non-empty string
**Validates: Requirements 1.1, 4.1**

Property 2: Invalid requests return proper error responses
*For any* request with invalid model name or malformed JSON to any endpoint, the API should return an appropriate HTTP error code (400, 422) with a JSON response containing "error" and "detail" fields
**Validates: Requirements 1.4, 3.1, 3.2, 4.4**

Property 3: Steps generation requests return proper response format
*For any* valid POST request to the steps generation endpoint with a question, the API response should contain a JSON object with either ("type": "step" and "next_step" field) or ("type": "final_answer" with "marks", "tip", and "mistakes" fields)
**Validates: Requirements 2.1, 2.5, 4.2, 4.3**

Property 4: HTTP responses include proper headers and status codes
*For any* API request to any endpoint, the response should include appropriate HTTP status codes and Content-Type application/json header
**Validates: Requirements 4.5**

Property 5: Integration layer passes correct parameters
*For any* API request that calls the underlying generation functions, the model name and properly formatted input should be passed to the existing question_generation.main or steps_generation.main modules
**Validates: Requirements 5.2, 5.3**

Property 6: Response parsing maintains format consistency
*For any* response returned from the existing generation functions, the API should parse and format them according to the specified API response format without losing required data
**Validates: Requirements 5.4**