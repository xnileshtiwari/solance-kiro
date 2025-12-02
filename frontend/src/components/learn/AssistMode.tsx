'use client';

import { BlockInterface, type BlockStep } from '../';

interface AssistModeProps {
    currentStep: BlockStep | null;
    completedSteps: Array<{ id: number; prompt: string; answer: string }>;
    onAnswerSubmit: (answer: string) => Promise<{ isCorrect: boolean; feedback?: string }>;
    isLoading: boolean;
}

export function AssistMode({ currentStep, completedSteps, onAnswerSubmit, isLoading }: AssistModeProps) {
    return (
        <BlockInterface
            currentStep={currentStep}
            completedSteps={completedSteps}
            onAnswerSubmit={onAnswerSubmit}
            isLoading={isLoading}
        />
    );
}
