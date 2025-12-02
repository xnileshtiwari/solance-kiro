import { useState, useEffect, useRef } from 'react';
import { useApiLearningSession } from './useApiLearningSession';
import { apiService } from '../services/apiService';
import { ConversationStep, PreviousQuestion } from '../types';
import { BlockStep } from '../components';
import { useModelMode } from '../contexts';

export function useLearnPage(subjectId: string) {
    const { modelName } = useModelMode();
    const {
        session,
        isLoading,
        error,
        generateNewQuestion,
        getNextStep,
        addConversationStep,
        addQuestionToHistory,
        markSessionComplete,
        clearError,
        currentLevel
    } = useApiLearningSession({ modelName });

    const [currentStep, setCurrentStep] = useState<BlockStep | null>(null);
    const [completedSteps, setCompletedSteps] = useState<Array<{ id: number; prompt: string; answer: string }>>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isLoadingNewQuestion, setIsLoadingNewQuestion] = useState(false);
    const [insight, setInsight] = useState<{ title: string; description: string } | undefined>();
    const [currentScore, setCurrentScore] = useState<number>(0);
    const [mode, setMode] = useState<'normal' | 'assist'>('normal');

    const questionInitialized = useRef(false);
    const stepInitialized = useRef(false);

    const handleSessionComplete = (marks: number, remarks: string[], tip?: string) => {
        markSessionComplete();
        setCurrentScore(marks);

        const questionHistory: PreviousQuestion = {
            question: session.currentQuestion,
            score: marks,
            remarks: remarks,
        };
        addQuestionToHistory(questionHistory);

        if (tip) {
            setInsight({
                title: "",
                description: tip
            });
        }

        setShowSuccessModal(true);
    };

    // Initialize session - generate question
    useEffect(() => {
        if (subjectId && !session.currentQuestion && !questionInitialized.current) {
            questionInitialized.current = true;
            setIsInitializing(true);
            clearError();

            generateNewQuestion(subjectId).then(() => {
                setIsInitializing(false);
            }).catch((err) => {
                console.error('Failed to initialize with API:', err);
                setIsInitializing(false);
                questionInitialized.current = false;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectId]);

    // Get first step when question is available (only in assist mode)
    useEffect(() => {
        const fetchFirstStep = async () => {
            const stepResponse = await getNextStep();
            if (stepResponse) {
                if (stepResponse.step_number === -1) {
                    handleSessionComplete(stepResponse.marks || 0, stepResponse.remarks || [], stepResponse.tip);
                } else {
                    setCurrentStep({
                        id: stepResponse.step_number,
                        prompt: stepResponse.prompt
                    });
                }
            }
        };

        if (mode === 'assist' && session.currentQuestion && !currentStep && completedSteps.length === 0 && !stepInitialized.current) {
            stepInitialized.current = true;
            fetchFirstStep().catch(() => {
                stepInitialized.current = false;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session.currentQuestion, mode]);

    const handleAnswerSubmit = async (answer: string): Promise<{ isCorrect: boolean; feedback?: string }> => {
        if (!currentStep) {
            return { isCorrect: false, feedback: 'No current step available' };
        }

        const conversationStep: ConversationStep = {
            step: currentStep.id,
            your_prompt: currentStep.prompt,
            student_answer: answer
        };
        addConversationStep(conversationStep);

        setCompletedSteps(prev => [
            ...prev,
            {
                id: currentStep.id,
                prompt: currentStep.prompt,
                answer: answer
            }
        ]);

        setCurrentStep(null);

        const updatedHistory = [...session.conversationHistory, conversationStep];
        const stepResponse = await getNextStep(updatedHistory);

        if (stepResponse) {
            if (stepResponse.step_number === -1) {
                setCurrentStep(null);
                handleSessionComplete(stepResponse.marks || 0, stepResponse.remarks || [], stepResponse.tip);
                return { isCorrect: true };
            } else {
                setCurrentStep({
                    id: stepResponse.step_number,
                    prompt: stepResponse.prompt
                });
                return { isCorrect: true };
            }
        }

        return { isCorrect: false, feedback: 'Failed to get next step' };
    };

    const handleNormalModeSubmit = async (answer: string) => {
        clearError();

        try {
            const response = await apiService.generateSteps({
                model_name: modelName,
                question: session.currentQuestion,
                student_answer: answer
            });

            if (response.step_number === -1) {
                handleSessionComplete(response.marks || 0, response.remarks || [], response.tip);
            }
        } catch (err) {
            console.error('Failed to submit normal mode answer:', err);
        }
    };

    const handleNextChallenge = async () => {
        setShowSuccessModal(false);
        setCurrentStep(null);
        setCompletedSteps([]);

        questionInitialized.current = false;
        stepInitialized.current = false;

        setIsLoadingNewQuestion(true);

        try {
            await generateNewQuestion(subjectId);
        } finally {
            setIsLoadingNewQuestion(false);
        }
    };

    const handleModeToggle = () => {
        const newMode = mode === 'normal' ? 'assist' : 'normal';
        setMode(newMode);

        setCurrentStep(null);
        setCompletedSteps([]);
        stepInitialized.current = false;

        if (newMode === 'assist' && session.currentQuestion) {
            stepInitialized.current = false;
        }
    };

    const handleRetryConnection = () => {
        questionInitialized.current = false;
        stepInitialized.current = false;

        clearError();
        setIsInitializing(true);

        generateNewQuestion(subjectId).then(() => {
            setIsInitializing(false);
        }).catch(() => {
            setIsInitializing(false);
        });
    };

    return {
        session,
        isLoading,
        error,
        currentLevel,
        currentStep,
        completedSteps,
        showSuccessModal,
        isInitializing,
        isLoadingNewQuestion,
        insight,
        currentScore,
        mode,
        handleAnswerSubmit,
        handleNormalModeSubmit,
        handleNextChallenge,
        handleModeToggle,
        handleRetryConnection,
        clearError
    };
}
