# Requirements Document

## Introduction

This specification defines the requirements for creating a FastAPI-based REST API for Solance, a personalized AI tutor system. The API will integrate existing question generation and steps generation functionality to provide endpoints for frontend applications to interact with the AI tutoring system.

## Glossary

- **Solance**: The personalized AI tutor system
- **Question Generation API**: REST endpoint that generates personalized algebra questions based on student performance history
- **Steps Generation API**: REST endpoint that provides step-by-step guidance for solving algebra problems
- **FastAPI**: The Python web framework used to build the REST API
- **Gemini API**: Google's generative AI service used for content generation
- **Student Performance History**: Array of previous questions, scores, and mistakes used for personalization

## Requirements

### Requirement 1

**User Story:** As a frontend developer, I want to request personalized algebra questions for students, so that I can display appropriate difficulty questions based on their learning progress.

#### Acceptance Criteria

1. WHEN a client sends a POST request to the question generation endpoint with model name and previous questions data, THEN the API SHALL return a JSON response containing a new algebra question
2. WHEN a client sends a request with an empty previous questions array, THEN the API SHALL generate a Level 1 beginner question for first-time users
3. WHEN a client sends a request with previous questions history, THEN the API SHALL analyze the performance and generate an appropriately difficulty-adjusted question
4. WHEN the request contains invalid model name or malformed JSON, THEN the API SHALL return appropriate HTTP error codes with descriptive error messages
5. WHEN the underlying Gemini API fails, THEN the API SHALL handle the error gracefully and return a meaningful error response

### Requirement 2

**User Story:** As a frontend developer, I want to request step-by-step guidance for algebra problems, so that I can provide interactive tutoring experiences to students.

#### Acceptance Criteria

1. WHEN a client sends a POST request to the steps generation endpoint with a question and no conversation history, THEN the API SHALL return the first step guidance for solving the problem
2. WHEN a client sends a request with question and conversation history, THEN the API SHALL analyze the student's progress and provide the next appropriate step or correction
3. WHEN a student provides a correct answer in the conversation history, THEN the API SHALL acknowledge correctness and provide the next step
4. WHEN a student provides an incorrect answer, THEN the API SHALL provide corrective guidance without giving away the solution
5. WHEN a problem is fully solved, THEN the API SHALL return final assessment with marks, personalized tips, and mistake analysis

### Requirement 3

**User Story:** As a system administrator, I want the API to validate input data and handle errors properly, so that the system remains stable and provides clear feedback to clients.

#### Acceptance Criteria

1. WHEN invalid JSON is sent to any endpoint, THEN the API SHALL return HTTP 400 with a clear error message
2. WHEN required fields are missing from requests, THEN the API SHALL return HTTP 422 with validation error details
3. WHEN the Google API key is missing or invalid, THEN the API SHALL return HTTP 500 with an appropriate error message
4. WHEN the Gemini API is unavailable, THEN the API SHALL return HTTP 503 with a service unavailable message
5. WHEN requests exceed reasonable size limits, THEN the API SHALL return HTTP 413 with payload too large error

### Requirement 4

**User Story:** As a frontend developer, I want consistent API response formats, so that I can reliably parse and display the tutoring content.

#### Acceptance Criteria

1. WHEN the question generation API succeeds, THEN it SHALL return JSON with a "question" field containing the algebra problem string
2. WHEN the steps generation API returns an intermediate step, THEN it SHALL return JSON with "type": "step" and "next_step" fields
3. WHEN the steps generation API completes a problem, THEN it SHALL return JSON with "type": "final_answer", "marks", "tip", and "mistakes" fields
4. WHEN any API endpoint encounters an error, THEN it SHALL return JSON with "error" and "detail" fields
5. WHEN API responses are returned, THEN they SHALL include appropriate HTTP status codes and Content-Type headers

### Requirement 5

**User Story:** As a developer, I want the API to integrate seamlessly with existing question and steps generation modules, so that I can leverage the current AI functionality without code duplication.

#### Acceptance Criteria

1. WHEN the API processes requests, THEN it SHALL import and use the existing generate functions from question_generation.main and steps_generation.main modules
2. WHEN the API calls the question generation function, THEN it SHALL pass the model name and properly formatted input JSON string
3. WHEN the API calls the steps generation function, THEN it SHALL pass the model name and properly formatted input string
4. WHEN the existing functions return responses, THEN the API SHALL parse and format them according to the API response specifications
5. WHEN environment variables are needed, THEN the API SHALL use the same .env configuration as the existing modules