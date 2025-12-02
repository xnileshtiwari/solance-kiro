import { PreviousQuestion, QuestionResponse, StepsResponse } from '../types';
import { StepData } from '../hooks/useStepProgression';

// Mock algebra problems for testing
export const mockAlgebraProblems: QuestionResponse[] = [
  {
    question: "Solve for x: 2x + 5 = 13",
    level: 1
  },
  {
    question: "Simplify: 3(x + 4) - 2x",
    level: 1
  },
  {
    question: "Solve for y: 4y - 7 = 2y + 9",
    level: 1
  },
  {
    question: "Factor: x² + 5x + 6",
    level: 1
  },
  {
    question: "Solve the system: x + y = 8, 2x - y = 1",
    level: 1
  }
];


// Mock step data for each problem
export const mockStepData: Record<string, StepData[]> = {
  "Solve for x: 2x + 5 = 13": [
    {
      stepNumber: 1,
      prompt: "Let's start by isolating the term with x. What do you get when you subtract 5 from both sides?",
      correctAnswers: ["2x = 8", "2x=8", "2 x = 8"],
      hintResponse: "Remember to subtract 5 from both sides of the equation. What's 13 - 5?",
      successMessage: "Great! You correctly subtracted 5 from both sides to get 2x = 8."
    },
    {
      stepNumber: 2,
      prompt: "Perfect! Now divide both sides by 2 to solve for x. What is x equal to?",
      correctAnswers: ["x = 4", "x=4", "4"],
      hintResponse: "Divide both sides by 2. What's 8 ÷ 2?",
      successMessage: "Excellent! You found that x = 4. Let's verify this answer."
    },
    {
      stepNumber: 3,
      prompt: "Let's check our answer. Substitute x = 4 back into the original equation 2x + 5 = 13. What do you get?",
      correctAnswers: ["2(4) + 5 = 13", "8 + 5 = 13", "13 = 13", "13=13"],
      hintResponse: "Replace x with 4 in the original equation: 2(4) + 5 = ?",
      successMessage: "Perfect! The equation checks out: 2(4) + 5 = 8 + 5 = 13. You've successfully solved for x!"
    }
  ],

  "Simplify: 3(x + 4) - 2x": [
    {
      stepNumber: 1,
      prompt: "First, let's distribute the 3 to both terms inside the parentheses. What do you get?",
      correctAnswers: ["3x + 12 - 2x", "3x+12-2x", "3x + 12 - 2x"],
      hintResponse: "Multiply 3 by each term in the parentheses: 3 × x and 3 × 4.",
      successMessage: "Great! You distributed correctly to get 3x + 12 - 2x."
    },
    {
      stepNumber: 2,
      prompt: "Now combine the like terms. What's the simplified expression?",
      correctAnswers: ["x + 12", "x+12", "12 + x"],
      hintResponse: "Combine the x terms: 3x - 2x = ?",
      successMessage: "Excellent! You combined like terms to get x + 12."
    }
  ],

  "Solve for y: 4y - 7 = 2y + 9": [
    {
      stepNumber: 1,
      prompt: "Let's get all the y terms on one side. Subtract 2y from both sides. What do you get?",
      correctAnswers: ["2y - 7 = 9", "2y-7=9", "2y - 7 = 9"],
      hintResponse: "Subtract 2y from the left side: 4y - 2y = ?",
      successMessage: "Good! You now have 2y - 7 = 9."
    },
    {
      stepNumber: 2,
      prompt: "Now add 7 to both sides to isolate the term with y. What do you get?",
      correctAnswers: ["2y = 16", "2y=16"],
      hintResponse: "Add 7 to both sides. What's 9 + 7?",
      successMessage: "Perfect! You have 2y = 16."
    },
    {
      stepNumber: 3,
      prompt: "Finally, divide both sides by 2 to solve for y. What is y?",
      correctAnswers: ["y = 8", "y=8", "8"],
      hintResponse: "Divide both sides by 2. What's 16 ÷ 2?",
      successMessage: "Excellent! You found that y = 8."
    }
  ]
};

// Mock conversation flows for testing
export const mockConversationFlows = {
  "Solve for x: 2x + 5 = 13": [
    {
      step: 1,
      your_prompt: "Let's start by isolating the term with x. What do you get when you subtract 5 from both sides?",
      student_answer: "2x = 8"
    },
    {
      step: 2,
      your_prompt: "Perfect! Now divide both sides by 2 to solve for x. What is x equal to?",
      student_answer: "x = 4"
    },
    {
      step: 3,
      your_prompt: "Let's check our answer. Substitute x = 4 back into the original equation 2x + 5 = 13. What do you get?",
      student_answer: "13 = 13"
    }
  ]
};

// Mock performance data
export const mockPerformanceData: PreviousQuestion[] = [
  {
    question: "Solve for x: x + 3 = 7",
    score: 100,
    remarks: []
  },
  {
    question: "Solve for y: 2y = 10",
    score: 85,
    remarks: ["Initially wrote 2y = 5"]
  },
  {
    question: "Simplify: 2x + 3x",
    score: 100,
    remarks: []
  }
];

// Helper function to get mock step data for a question
export function getMockStepsForQuestion(question: string): StepData[] {
  return mockStepData[question] || [];
}

// Helper function to get a random mock problem
export function getRandomMockProblem(): QuestionResponse {
  const randomIndex = Math.floor(Math.random() * mockAlgebraProblems.length);
  return mockAlgebraProblems[randomIndex];
}

// Helper function to simulate API delay
export function simulateApiDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}