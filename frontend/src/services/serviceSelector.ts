import { apiService } from './apiService';
import { mockApiService } from './mockApiService';
import { QuestionRequest, QuestionResponse, StepsRequest, StepsResponse } from '../types';

export interface LearningService {
  generateQuestion(request: QuestionRequest): Promise<QuestionResponse>;
  generateSteps(request: StepsRequest): Promise<StepsResponse>;
  healthCheck?(): Promise<boolean>;
}

class ServiceSelector {
  private static instance: ServiceSelector;
  private useApiService: boolean = true;
  private apiHealthy: boolean = true;

  static getInstance(): ServiceSelector {
    if (!ServiceSelector.instance) {
      ServiceSelector.instance = new ServiceSelector();
    }
    return ServiceSelector.instance;
  }

  /**
   * Check if API service is available and healthy
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      this.apiHealthy = await apiService.healthCheck();
      return this.apiHealthy;
    } catch (error) {
      console.warn('API health check failed:', error);
      this.apiHealthy = false;
      return false;
    }
  }

  /**
   * Get the appropriate service based on configuration and health
   */
  async getService(): Promise<LearningService> {
    // In development, allow forcing mock mode via environment variable
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_FORCE_MOCK === 'true') {
      return mockApiService;
    }

    // If explicitly set to use mock service
    if (!this.useApiService) {
      return mockApiService;
    }

    // Check API health if we haven't recently
    if (this.useApiService && this.apiHealthy) {
      const isHealthy = await this.checkApiHealth();
      if (!isHealthy) {
        console.warn('API service is unhealthy, falling back to mock service');
        return mockApiService;
      }
    }

    return apiService;
  }

  /**
   * Force use of mock service (useful for fallback scenarios)
   */
  useMockService(): void {
    this.useApiService = false;
  }

  /**
   * Force use of API service
   */
  useRealApiService(): void {
    this.useApiService = true;
  }

  /**
   * Reset to automatic service selection
   */
  resetServiceSelection(): void {
    this.useApiService = true;
    this.apiHealthy = true;
  }

  /**
   * Get current service type
   */
  getCurrentServiceType(): 'api' | 'mock' {
    return this.useApiService && this.apiHealthy ? 'api' : 'mock';
  }
}

export const serviceSelector = ServiceSelector.getInstance();