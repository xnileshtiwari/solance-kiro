import { 
  QuestionRequest, 
  QuestionResponse, 
  StepsRequest, 
  StepsResponse,
  ConversationStep 
} from '../types';
import { 
  mockAlgebraProblems, 
  getMockStepsForQuestion, 
  simulateApiDelay,
  getRandomMockProblem 
} from '../data/mockData';

export class MockApiService {
  private static instance: MockApiService;
  private currentQuestionSteps: any[] = [];
  private currentStepIndex: number = 0;

  static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  async generateQuestion(request: QuestionRequest): Promise<QuestionResponse> {
    await simulateApiDelay(800);
    
    // For mock purposes, return a random problem
    // In real implementation, this would consider previous_questions for difficulty
    const question = getRandomMockProblem();
    
    // Set up steps for this question
    this.currentQuestionSteps = getMockStepsForQuestion(question.question);
    this.currentStepIndex = 0;
    
    return question;
  }

  async generateSteps(request: StepsRequest): Promise<StepsResponse> {
    await simulateApiDelay(600);
    
    const { question, conversation_history = [] } = request;
    
    // Get steps for the current question
    const questionSteps = getMockStepsForQuestion(question);
    
    if (questionSteps.length === 0) {
      throw new Error(`No steps found for question: ${question}`);
    }

    // Determine which step to return based on conversation history
    const nextStepIndex = conversation_history.length;
    
    if (nextStepIndex >= questionSteps.length) {
      throw new Error('All steps completed for this question');
    }

    const stepData = questionSteps[nextStepIndex];
    
    return {
      step_number: stepData.stepNumber,
      prompt: stepData.prompt
    };
  }

  // Helper method to get step data for validation (not part of real API)
  getStepDataForValidation(question: string, stepNumber: number) {
    const questionSteps = getMockStepsForQuestion(question);
    return questionSteps.find(step => step.stepNumber === stepNumber);
  }

  // Reset service state (useful for testing)
  reset(): void {
    this.currentQuestionSteps = [];
    this.currentStepIndex = 0;
  }
}

// Export singleton instance
export const mockApiService = MockApiService.getInstance();