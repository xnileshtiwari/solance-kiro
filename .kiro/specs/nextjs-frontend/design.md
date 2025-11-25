# Design Document

## Overview

The Next.js frontend application will replicate the existing HTML homepage's visual design while integrating dynamic API functionality for algebra learning. The application uses React components to manage state and API interactions, maintaining the cozy aesthetic and smooth user experience of the original design.

## Architecture

The application follows a component-based architecture with clear separation between presentation and business logic:

- **Pages**: Next.js page components handling routing and initial rendering
- **Components**: Reusable UI components maintaining visual consistency
- **Services**: API integration layer for backend communication
- **State Management**: React hooks for local state and session management
- **Styling**: CSS modules and Tailwind CSS for design system consistency

## Components and Interfaces

### Core Components

**HomePage Component**
- Renders the landing page with topic input and navigation
- Manages topic validation and transition to learning mode
- Handles hackathon constraint messaging for non-algebra topics

**LearningApp Component**
- Manages the complete learning session state
- Orchestrates API calls for questions and steps
- Handles conversation history and progress tracking

**ChatInterface Component**
- Renders the step-by-step conversation flow
- Displays tutor messages and student responses
- Manages input validation and feedback display

**SuccessModal Component**
- Shows completion feedback and performance insights
- Handles session reset and new question generation

### API Service Layer

**QuestionService**
```typescript
interface QuestionRequest {
  model_name: string;
  previous_questions: PreviousQuestion[];
}

interface PreviousQuestion {
  question: string;
  score: number;
  mistakes: string[];
}
```

**StepsService**
```typescript
interface StepsRequest {
  model_name: string;
  question: string;
  conversation_history?: ConversationStep[];
}

interface ConversationStep {
  step: number;
  your_prompt: string;
  student_answer: string;
}
```

## Data Models

### Learning Session State
```typescript
interface LearningSession {
  currentQuestion: string;
  currentStep: number;
  conversationHistory: ConversationStep[];
  questionHistory: PreviousQuestion[];
  isComplete: boolean;
}
```

### API Response Models
```typescript
interface QuestionResponse {
  question: string;
  }

interface StepsResponse {
  step_number: number;
  prompt: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Visual consistency preservation
*For any* UI component, the rendered output should maintain the same styling properties (colors, fonts, layout) as the original HTML design
**Validates: Requirements 1.2**

Property 2: Interactive behavior consistency
*For any* interactive UI element, user interactions should trigger the same visual feedback and state changes as the original design
**Validates: Requirements 1.3**

Property 3: Navigation transition consistency
*For any* navigation action between views, the system should maintain smooth transitions without visual artifacts or state loss
**Validates: Requirements 1.5**

Property 4: Algebra topic routing
*For any* input containing algebra-related terms, the system should successfully transition to the learning interface
**Validates: Requirements 2.1**

Property 5: Non-algebra constraint handling
*For any* input not containing algebra-related terms, the system should display the constraint message and redirect appropriately
**Validates: Requirements 2.2**

Property 6: Session initialization API calls
*For any* new learning session, the system should make the correct API calls to generate questions and initial steps
**Validates: Requirements 2.3, 3.1**

Property 7: API response rendering
*For any* valid API response, the system should correctly display the content in the appropriate UI components
**Validates: Requirements 2.4, 3.2**

Property 8: State initialization consistency
*For any* new learning session, the conversation history should start empty while maintaining other session state
**Validates: Requirements 2.5**

Property 9: Answer validation accuracy
*For any* student answer submission, the validation should correctly determine if the answer matches expected responses
**Validates: Requirements 3.3**

Property 10: Correct answer progression
*For any* correct answer submission, the system should update conversation history and request the next step from the API
**Validates: Requirements 3.4**


Property 12: Conversation history tracking
*For any* student response, the answer should be correctly added to the conversation history with proper formatting
**Validates: Requirements 4.1**

Property 13: API context inclusion
*For any* steps API call, the request should include the complete conversation history in the correct format
**Validates: Requirements 4.2**

Property 14: Question completion data preparation
*For any* completed problem, the system should correctly format performance data for subsequent question generation
**Validates: Requirements 4.3**

Property 15: Historical performance inclusion
*For any* new question generation request, the API call should include previous question performance data
**Validates: Requirements 4.4**

Property 16: Session state consistency
*For any* learning session, state should remain consistent across all API interactions and UI updates
**Validates: Requirements 4.5**

Property 17: Completion detection and modal display
*For any* completed problem sequence, the system should detect completion and display the success modal
**Validates: Requirements 5.1**

Property 18: New question generation with history
*For any* "Next Challenge" action, the system should generate a new question using accumulated question history
**Validates: Requirements 5.3**

Property 19: Session reset with history preservation
*For any* new question generation, conversation history should reset while question history persists
**Validates: Requirements 5.4, 5.5**

Property 20: API error handling
*For any* API failure, the system should display appropriate error messages without crashing
**Validates: Requirements 6.1**


Property 22: Malformed response handling
*For any* malformed API response, the system should handle parsing errors gracefully without application crashes
**Validates: Requirements 6.4**

Property 23: Rate limit backoff handling
*For any* rate limit response, the system should implement appropriate backoff strategies before retrying
**Validates: Requirements 6.5**

