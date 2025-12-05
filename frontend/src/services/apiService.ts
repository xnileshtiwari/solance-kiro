import {
  QuestionRequest,
  QuestionResponse,
  StepsRequest,
  StepsResponse,
  ConversationStep,
  Subject,
  GradingRequest,
  GradingResponse
} from '../types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const DEFAULT_MODEL_NAME = 'gemini-2.5-flash';


// API Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Utility function for exponential backoff
function calculateDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

// Utility function for making HTTP requests with retry logic
async function makeRequest<T>(
  url: string,
  options: RequestInit,
  retryCount: number = 0
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.INTERNAL_API_KEY || '',
        ...options.headers,
      },
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle rate limiting with retry
      if (response.status === 429 || response.status === 503) {
        if (retryCount < RETRY_CONFIG.maxRetries) {
          const delay = calculateDelay(retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeRequest<T>(url, options, retryCount + 1);
        }
      }

      throw new ApiError(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.error
      );
    }

    return await response.json();
  } catch (error) {
    // Handle network errors with retry
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = calculateDelay(retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequest<T>(url, options, retryCount + 1);
      }
      throw new NetworkError('Failed to connect to the server. Please check your internet connection.');
    }

    // Re-throw ApiError and other known errors
    throw error;
  }
}

export class ApiService {
  private static instance: ApiService;

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Generate a new algebra question based on previous performance
   */
  async generateQuestion(request: QuestionRequest): Promise<QuestionResponse> {
    const url = `${API_BASE_URL}/api/v1/generate-question`;

    // Build request body with required fields
    const requestBody: any = {
      model_name: request.model_name || DEFAULT_MODEL_NAME,
      user_id: request.user_id,
      subject_id: request.subject_id,
      previous_questions: request.previous_questions,
    };

    try {
      const response = await makeRequest<QuestionResponse>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return response;
    } catch (error) {
      console.error('Question generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate step-by-step guidance for solving algebra problems
   */
  async generateSteps(request: StepsRequest): Promise<StepsResponse> {
    const url = `${API_BASE_URL}/api/v1/generate-steps`;

    // Always include model_name and question
    const requestBody: any = {
      model_name: request.model_name || DEFAULT_MODEL_NAME,
      question: request.question,
    };

    // Add conversation_history if present (assist mode)
    if (request.conversation_history && request.conversation_history.length > 0) {
      requestBody.conversation_history = request.conversation_history;
    }

    // Add student_answer if present (normal mode)
    if (request.student_answer) {
      requestBody.student_answer = request.student_answer;
    }

    try {
      const response = await makeRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // Handle different response types from the backend
      if (response.type === 'step') {
        return {
          step_number: (request.conversation_history?.length || 0) + 1,
          prompt: response.next_step,
        };
      } else if (response.type === 'final_answer') {
        // For final answer, we'll return a special completion message
        return {
          step_number: -1, // Special indicator for completion
          prompt: `Great job! You've completed this problem.`,
          marks: response.marks,
          remarks: response.remarks,
          tip: response.tip,
        };
      } else {
        throw new ApiError('Invalid response format from steps API', 500);
      }
    } catch (error) {
      console.error('Steps generation failed:', error);
      throw error;
    }
  }

  /**
   * Grade a student's answer (Solo Mode)
   */
  async gradeAnswer(request: GradingRequest): Promise<GradingResponse> {
    const url = `${API_BASE_URL}/api/v1/grade-answer`;

    const requestBody = {
      model_name: request.model_name || DEFAULT_MODEL_NAME,
      question: request.question,
      student_answer: request.student_answer,
    };

    try {
      const response = await makeRequest<GradingResponse>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return response;
    } catch (error) {
      console.error('Grading failed:', error);
      throw error;
    }
  }

  /**
   * Fetch all subjects for the current user
   */
  async getSubjects(userId: string): Promise<Subject[]> {
    const CACHE_KEY = `cached_subjects_${userId}`;

    // Check cache first
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error('Failed to parse cached subjects', e);
          localStorage.removeItem(CACHE_KEY);
        }
      }
    }

    const url = `${API_BASE_URL}/api/v1/subjects?user_id=${userId}`;

    try {
      const response = await makeRequest<Subject[]>(url, {
        method: 'GET',
      });

      // Update cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify(response));
      }

      return response;
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      throw error;
    }
  }

  /**
   * Create a new subject
   */
  async createSubject(subjectData: any): Promise<any> {
    const url = `${API_BASE_URL}/api/v1/subjects`;

    try {
      const response = await makeRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify(subjectData),
      });

      // Invalidate all cached subjects on new subject creation
      if (typeof window !== 'undefined') {
        // Clear all cached_subjects_* keys
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('cached_subjects_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      return response;
    } catch (error) {
      console.error('Failed to create subject:', error);
      throw error;
    }
  }

  /**
   * Check if the API service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${API_BASE_URL}/health`;
      await makeRequest<any>(url, { method: 'GET' });
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Upload a file to Gemini via our API route
   */
  async uploadFile(file: File): Promise<{ uri: string; mime_type: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
          error.error || 'File upload failed',
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  /**
   * Generate studio response (Solance AI chatbot)
   */
  async studioGenerate(request: {
    model_name?: string;
    user_input: string;
    history: Array<{ user: string; model: string }>;
    file?: { uri: string; mime_type: string };
  }): Promise<{
    tool: 'conversation' | 'cartridge_schema';
    args: any;
    text: string | null;
    error: string | null;
  }> {
    const url = `${API_BASE_URL}/api/v1/studio/generate`;

    const requestBody = {
      model_name: request.model_name || 'gemini-2.5-pro',
      user_input: request.user_input,
      history: request.history,
      ...(request.file && { file: request.file }),
    };

    try {
      const response = await makeRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return response;
    } catch (error) {
      console.error('Studio generate failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();