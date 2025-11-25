# API Integration Guide

This document explains how to use the new API service layer that connects the frontend to the Solance backend API.

## Overview

The API service layer provides:
- Real API integration with the Solance backend
- Comprehensive error handling with retry logic
- Automatic fallback to mock service when API is unavailable
- User-friendly error messages and recovery options

## Components

### 1. API Service (`src/services/apiService.ts`)
- Handles HTTP requests to the backend API
- Implements retry logic with exponential backoff
- Provides error classification and user-friendly messages
- Supports question generation and steps generation endpoints

### 2. API Learning Session Hook (`src/hooks/useApiLearningSession.ts`)
- React hook for managing learning sessions with real API calls
- Handles loading states and error management
- Maintains conversation history and question history
- Provides methods for generating questions and getting step guidance

### 3. Error Display Components
- `ApiErrorDisplay`: Shows inline error messages with retry options
- `ApiFallback`: Full-page fallback when API is completely unavailable

### 4. Service Selector (`src/services/serviceSelector.ts`)
- Automatically chooses between real API and mock service
- Performs health checks on the API service
- Allows manual switching between services

## Usage

### Basic Integration

Replace the existing mock-based learning page with the API-enabled version:

```typescript
import { useApiLearningSession } from '../hooks';

function LearnPage() {
  const { 
    session, 
    isLoading, 
    error, 
    generateNewQuestion, 
    getNextStep,
    clearError 
  } = useApiLearningSession();
  
  // Use the session data and methods as needed
}
```

### Environment Configuration

Create a `.env.local` file based on `.env.local.example`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Development Settings
NEXT_PUBLIC_FORCE_MOCK=false

# Production Settings  
NEXT_PUBLIC_ENABLE_FALLBACK=true
```

### Error Handling

The API service automatically handles:
- Network connectivity issues
- API rate limiting (429 errors)
- Service unavailability (503 errors)
- Authentication errors (500 errors)
- Malformed responses

Users see appropriate error messages and retry options for each scenario.

### Fallback Behavior

When the API is unavailable:
1. Users see a connection error screen
2. They can retry the connection
3. They can switch to demo mode (mock service)
4. The app gracefully degrades functionality

## API Endpoints

### Question Generation
- **Endpoint**: `POST /api/v1/generate-question`
- **Purpose**: Generate personalized algebra questions
- **Request**: `QuestionRequest` with model name and previous questions
- **Response**: `QuestionResponse` with generated question

### Steps Generation  
- **Endpoint**: `POST /api/v1/generate-steps`
- **Purpose**: Provide step-by-step guidance
- **Request**: `StepsRequest` with model name, question, and conversation history
- **Response**: `StepsResponse` with next step or completion data

## Testing

### Development Mode
Set `NEXT_PUBLIC_FORCE_MOCK=true` to test with mock data while developing.

### API Testing
1. Start the backend server: `cd backend && python api.py`
2. Set `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. Test the full integration flow

### Error Testing
Temporarily stop the backend server to test error handling and fallback behavior.

## Migration from Mock Service

To migrate existing components:

1. Replace `useLearningSession` with `useApiLearningSession`
2. Add error handling UI components
3. Update question/step generation logic to use async API calls
4. Add loading states for API operations

## Production Deployment

1. Set `NEXT_PUBLIC_API_URL` to your production API URL
2. Ensure CORS is properly configured on the backend
3. Set up proper error monitoring and logging
4. Consider implementing API caching for better performance