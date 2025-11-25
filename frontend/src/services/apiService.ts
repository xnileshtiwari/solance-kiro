import { 
  QuestionRequest, 
  QuestionResponse, 
  StepsRequest, 
  StepsResponse,
  ConversationStep 
} from '../types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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
    
    const requestBody = {
      model_name: request.model_name || DEFAULT_MODEL_NAME,
      previous_questions: request.previous_questions || [],
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
    
    const requestBody = {
      model_name: request.model_name || DEFAULT_MODEL_NAME,
      question: request.question,
      conversation_history: request.conversation_history || undefined,
    };

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
          prompt: `Great job! You've completed this problem. ${response.tip}`,
          marks: response.marks,
          mistakes: response.mistakes,
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
}

// Export singleton instance
export const apiService = ApiService.getInstance();