// Subject Types
export interface Subject {
  subject_id: string;
  display_name: string;
  subject: string;
  description: string;
  curriculum_concepts: string[];
}

// API Request/Response Types
export interface QuestionRequest {
  model_name: string;
  user_id: string;
  subject_id: string;
  previous_questions: PreviousQuestion[];
}

export interface PreviousQuestion {
  question: string;
  score: number;
  remarks: string[];
}

export interface QuestionResponse {
  question: string;
  level: number;
}

export interface StepsRequest {
  model_name: string;
  question: string;
  conversation_history?: ConversationStep[];
  student_answer?: string;
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
  remarks?: string[];
  tip?: string;
}

// Learning Session State Types
export interface LearningSession {
  currentQuestion: string;
  currentStep: number;
  conversationHistory: ConversationStep[];
  questionHistory: PreviousQuestion[];
  isComplete: boolean;
}

// Grading API Types (Solo Mode)
export interface GradingRequest {
  model_name: string;
  question: string;
  student_answer: string;
}

export interface GradingResponse {
  marks: number;
  correction: string;
  remarks: string[];
}

// UI Component Types
export interface Step {
  id: number;
  ai_text: string;
  correct_answers: string[];
  hint_response: string;
  success_msg: string;
}