// API Request/Response Types
export interface QuestionRequest {
  model_name: string;
  previous_questions: PreviousQuestion[];
}

export interface PreviousQuestion {
  question: string;
  score: number;
  mistakes: string[];
}

export interface QuestionResponse {
  question: string;
}

export interface StepsRequest {
  model_name: string;
  question: string;
  conversation_history?: ConversationStep[];
}

export interface ConversationStep {
  step: number;
  your_prompt: string;
  student_answer: string;
}

export interface StepsResponse {
  step_number: number;
  prompt: string;
  marks?: number;
  mistakes?: string[];
}

// Learning Session State Types
export interface LearningSession {
  currentQuestion: string;
  currentStep: number;
  conversationHistory: ConversationStep[];
  questionHistory: PreviousQuestion[];
  isComplete: boolean;
}

// UI Component Types
export interface Step {
  id: number;
  ai_text: string;
  correct_answers: string[];
  hint_response: string;
  success_msg: string;
}