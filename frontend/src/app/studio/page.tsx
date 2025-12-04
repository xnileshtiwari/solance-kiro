'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowRight, CheckCircle, Warning, Sparkle, FloppyDisk, Plus, Trash,
    CaretDown, CaretUp, PaperPlaneRight, Paperclip, X, File, FilePdf,
    FileImage, FileVideo, FileText, Robot
} from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/apiService';
import {
    StudioMessage, StudioHistory, CartridgeSchema, CurriculumLevel, CartridgeMeta
} from '../../types';

// Supported file types
const SUPPORTED_TYPES = [
    'application/pdf',
    'text/markdown',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
];

const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage size={20} weight="fill" className="text-purple-500" />;
    if (type.startsWith('video/')) return <FileVideo size={20} weight="fill" className="text-red-500" />;
    if (type === 'application/pdf') return <FilePdf size={20} weight="fill" className="text-orange-500" />;
    return <FileText size={20} weight="fill" className="text-blue-500" />;
};

export default function StudioPage() {
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth({ requireAuth: true, redirectTo: '/auth' });
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Chat State
    const [messages, setMessages] = useState<StudioMessage[]>([]);
    const [history, setHistory] = useState<StudioHistory[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{ uri: string; mime_type: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Schema Form State
    const [cartridgeSchema, setCartridgeSchema] = useState<CartridgeSchema | null>(null);
    const [expandedLevel, setExpandedLevel] = useState<number | null>(1);

    // UI State
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Initial welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: "Hi! I'm **Solance AI** 🌟\n\nTell me what you'd like to learn, and I'll create a personalized course for you. You can also upload documents (PDF, images, videos) to help me understand your learning goals better.\n\n*Example: \"I want to learn Python programming\" or \"Create a course from this textbook\"*",
                timestamp: new Date(),
            }]);
        }
    }, [messages.length]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle file selection
    const handleFileSelect = async (file: File) => {
        if (!SUPPORTED_TYPES.includes(file.type)) {
            setError(`Unsupported file type. Supported: PDF, images, videos, markdown, text files.`);
            return;
        }

        setPendingFile(file);
        setIsUploading(true);
        setError(null);

        try {
            const result = await apiService.uploadFile(file);
            setUploadedFile(result);
        } catch (err: any) {
            setError(err.message || 'Failed to upload file');
            setPendingFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    // Clear pending file
    const clearFile = () => {
        setPendingFile(null);
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Send message
    const handleSend = async () => {
        if (!inputValue.trim() && !uploadedFile) return;
        if (isLoading) return;

        const userMessage: StudioMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
            file: pendingFile ? {
                name: pendingFile.name,
                type: pendingFile.type,
                uri: uploadedFile?.uri,
            } : undefined,
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiService.studioGenerate({
                user_input: inputValue,
                history: history,
                file: uploadedFile || undefined,
            });

            // Clear file after sending
            clearFile();

            if (response.error) {
                throw new Error(response.error);
            }

            if (response.tool === 'conversation') {
                const aiMessage: StudioMessage = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: (response.args as { message: string }).message,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiMessage]);

                // Update history
                setHistory(prev => [...prev, {
                    user: inputValue,
                    model: aiMessage.content,
                }]);
            } else if (response.tool === 'cartridge_schema') {
                // Show the schema form
                setCartridgeSchema(response.args as CartridgeSchema);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate response');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Schema form handlers
    const handleMetaChange = (field: keyof CartridgeMeta, value: any) => {
        if (!cartridgeSchema) return;
        setCartridgeSchema({
            ...cartridgeSchema,
            meta: { ...cartridgeSchema.meta, [field]: value },
        });
    };

    const handleLevelChange = (index: number, field: keyof CurriculumLevel, value: any) => {
        if (!cartridgeSchema) return;
        const newCurriculum = [...cartridgeSchema.curriculum];
        newCurriculum[index] = { ...newCurriculum[index], [field]: value };
        setCartridgeSchema({ ...cartridgeSchema, curriculum: newCurriculum });
    };

    const handleConceptChange = (levelIndex: number, conceptIndex: number, value: string) => {
        if (!cartridgeSchema) return;
        const newCurriculum = [...cartridgeSchema.curriculum];
        const newConcepts = [...newCurriculum[levelIndex].concepts];
        newConcepts[conceptIndex] = value;
        newCurriculum[levelIndex].concepts = newConcepts;
        setCartridgeSchema({ ...cartridgeSchema, curriculum: newCurriculum });
    };

    const addConcept = (levelIndex: number) => {
        if (!cartridgeSchema) return;
        const newCurriculum = [...cartridgeSchema.curriculum];
        newCurriculum[levelIndex].concepts.push('');
        setCartridgeSchema({ ...cartridgeSchema, curriculum: newCurriculum });
    };

    const removeConcept = (levelIndex: number, conceptIndex: number) => {
        if (!cartridgeSchema) return;
        const newCurriculum = [...cartridgeSchema.curriculum];
        newCurriculum[levelIndex].concepts = newCurriculum[levelIndex].concepts.filter((_, i) => i !== conceptIndex);
        setCartridgeSchema({ ...cartridgeSchema, curriculum: newCurriculum });
    };

    const addLevel = () => {
        if (!cartridgeSchema) return;
        const newLevel: CurriculumLevel = {
            level: cartridgeSchema.curriculum.length + 1,
            name: '',
            description: '',
            concepts: [''],
            question_style: 'Conceptual Understanding',
        };
        setCartridgeSchema({
            ...cartridgeSchema,
            curriculum: [...cartridgeSchema.curriculum, newLevel],
        });
        setExpandedLevel(newLevel.level);
    };

    const removeLevel = (index: number) => {
        if (!cartridgeSchema || cartridgeSchema.curriculum.length <= 1) return;
        const newCurriculum = cartridgeSchema.curriculum
            .filter((_, i) => i !== index)
            .map((level, i) => ({ ...level, level: i + 1 }));
        setCartridgeSchema({ ...cartridgeSchema, curriculum: newCurriculum });
    };

    // Submit subject
    const handleSubmit = async () => {
        if (!cartridgeSchema || !user) return;

        setError(null);
        setIsSubmitting(true);

        try {
            const payload = {
                meta: {
                    ...cartridgeSchema.meta,
                    created_by: user.id,
                },
                curriculum: cartridgeSchema.curriculum.map(c => ({
                    ...c,
                    concepts: c.concepts.filter(concept => concept.trim() !== ''),
                })),
            };

            await apiService.createSubject(payload);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to create subject');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Go back to chat from schema view
    const handleBackToChat = () => {
        setCartridgeSchema(null);
    };

    if (isAuthLoading || !isAuthenticated) {
        return null;
    }

    // Success view
    if (success) {
        return (
            <div className="flex items-center justify-center py-20 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-stone-100 relative z-10">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} weight="fill" className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-coffee mb-2">Subject Created!</h2>
                    <p className="text-stone-500 mb-8">
                        Your new subject has been successfully added to the curriculum.
                    </p>
                    <button
                        onClick={() => router.push('/subjects')}
                        className="w-full py-3 px-6 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Start Learning</span>
                        <ArrowRight size={20} weight="bold" />
                    </button>
                </div>
            </div>
        );
    }

    // Schema form view
    if (cartridgeSchema) {
        return (
            <div className="min-h-screen flex flex-col">
                <main className="flex-grow px-4 md:px-8 py-8 max-w-4xl mx-auto w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <button
                                onClick={handleBackToChat}
                                className="text-sm text-stone-500 hover:text-stone-700 mb-2 flex items-center gap-1"
                            >
                                ← Back to chat
                            </button>
                            <div className="inline-flex items-center gap-2 text-accent-coral font-bold text-sm mb-1">
                                <Robot size={16} weight="fill" />
                                <span>Solance AI</span>
                            </div>
                            <h1 className="text-3xl font-bold text-text-coffee">Review Your Course</h1>
                            <p className="text-stone-500 mt-1">Edit any fields before saving your personalized learning path.</p>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-[#4A4036] text-white rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-stone-200"
                        >
                            {isSubmitting ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <FloppyDisk size={20} weight="bold" />
                            )}
                            <span>Save Subject</span>
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3">
                            <Warning size={20} weight="fill" className="mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-bold">Error</p>
                                <p className="text-sm opacity-90">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* Basic Info Section */}
                        <section className="hero-card p-8 !transform-none !transition-none hover:!transform-none">
                            <h2 className="text-xl font-bold text-text-coffee mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Sparkle size={20} weight="bold" />
                                </div>
                                Course Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-stone-700">Display Name</label>
                                    <div className="cozy-input-container !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                        <input
                                            type="text"
                                            value={cartridgeSchema.meta.display_name}
                                            onChange={(e) => handleMetaChange('display_name', e.target.value)}
                                            placeholder="e.g., Advanced Algebra"
                                            className="cozy-input w-full !text-left !pl-4"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-stone-700">Subject Category</label>
                                    <div className="cozy-input-container !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                        <input
                                            type="text"
                                            value={cartridgeSchema.meta.subject}
                                            onChange={(e) => handleMetaChange('subject', e.target.value)}
                                            placeholder="e.g., Mathematics"
                                            className="cozy-input w-full !text-left !pl-4"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-stone-700">Language</label>
                                    <div className="cozy-input-container !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                        <input
                                            type="text"
                                            value={cartridgeSchema.meta.language}
                                            onChange={(e) => handleMetaChange('language', e.target.value)}
                                            placeholder="e.g., en-US"
                                            className="cozy-input w-full !text-left !pl-4"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-stone-700">Visibility</label>
                                    <div className="cozy-input-container !transform-none !transition-none hover:!transform-none focus-within:!transform-none flex items-center gap-3 !px-4">
                                        <input
                                            type="checkbox"
                                            checked={cartridgeSchema.meta.public}
                                            onChange={(e) => handleMetaChange('public', e.target.checked)}
                                            className="w-5 h-5 accent-accent-coral cursor-pointer"
                                            id="public-toggle"
                                        />
                                        <label htmlFor="public-toggle" className="text-stone-600 cursor-pointer select-none">
                                            Make this subject public
                                        </label>
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-stone-700">Description</label>
                                    <div className="cozy-input-container !rounded-3xl !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                        <textarea
                                            value={cartridgeSchema.meta.description}
                                            onChange={(e) => handleMetaChange('description', e.target.value)}
                                            placeholder="Course description..."
                                            rows={3}
                                            className="cozy-input w-full !text-left !pl-4 !py-2 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Curriculum Section */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-bold text-text-coffee flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Sparkle size={20} weight="bold" />
                                    </div>
                                    Curriculum Levels
                                </h2>
                                <button
                                    onClick={addLevel}
                                    className="text-sm font-bold text-accent-coral hover:text-orange-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                                >
                                    <Plus size={16} weight="bold" />
                                    Add Level
                                </button>
                            </div>

                            {cartridgeSchema.curriculum.map((level, index) => (
                                <div key={index} className="hero-card overflow-hidden !p-0 !transform-none !transition-none hover:!transform-none">
                                    <div
                                        className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/40 transition-colors"
                                        onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/80 text-stone-600 flex items-center justify-center font-bold text-lg shadow-sm">
                                                {level.level}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-stone-800 text-lg">{level.name || `Level ${level.level}`}</h3>
                                                <p className="text-sm text-stone-500">{level.concepts.length} concepts • {level.question_style}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeLevel(index);
                                                }}
                                                disabled={cartridgeSchema.curriculum.length === 1}
                                                className="p-2 text-stone-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                                            >
                                                <Trash size={20} />
                                            </button>
                                            {expandedLevel === level.level ? (
                                                <CaretUp size={20} className="text-stone-400" />
                                            ) : (
                                                <CaretDown size={20} className="text-stone-400" />
                                            )}
                                        </div>
                                    </div>

                                    {expandedLevel === level.level && (
                                        <div className="p-6 border-t border-white/50 bg-white/20">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-stone-700">Level Name</label>
                                                    <div className="cozy-input-container !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                                        <input
                                                            type="text"
                                                            value={level.name}
                                                            onChange={(e) => handleLevelChange(index, 'name', e.target.value)}
                                                            placeholder="e.g., Basic Equations"
                                                            className="cozy-input w-full !text-left !pl-4"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-stone-700">Question Style</label>
                                                    <div className="cozy-input-container !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                                        <input
                                                            type="text"
                                                            value={level.question_style}
                                                            onChange={(e) => handleLevelChange(index, 'question_style', e.target.value)}
                                                            placeholder="e.g., Conceptual/Numerical"
                                                            className="cozy-input w-full !text-left !pl-4"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-6">
                                                <label className="text-sm font-bold text-stone-700">Level Description</label>
                                                <div className="cozy-input-container !rounded-3xl !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                                    <textarea
                                                        value={level.description}
                                                        onChange={(e) => handleLevelChange(index, 'description', e.target.value)}
                                                        placeholder="Describe what this level covers..."
                                                        rows={2}
                                                        className="cozy-input w-full !text-left !pl-4 !py-2 resize-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-sm font-bold text-stone-700 block">Concepts</label>
                                                {level.concepts.map((concept, cIndex) => (
                                                    <div key={cIndex} className="flex gap-2">
                                                        <div className="cozy-input-container flex-grow !transform-none !transition-none hover:!transform-none focus-within:!transform-none">
                                                            <input
                                                                type="text"
                                                                value={concept}
                                                                onChange={(e) => handleConceptChange(index, cIndex, e.target.value)}
                                                                placeholder="e.g., Linear equations"
                                                                className="cozy-input w-full !text-left !pl-4"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => removeConcept(index, cIndex)}
                                                            className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => addConcept(index)}
                                                    className="text-sm font-bold text-accent-coral hover:text-orange-700 flex items-center gap-1 mt-2 ml-1"
                                                >
                                                    <Plus size={14} weight="bold" />
                                                    Add Concept
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>
                    </div>
                </main>
            </div>
        );
    }

    // Chat view
    return (
        <div
            className="min-h-screen flex flex-col"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag overlay */}
            {isDragging && (
                <div className="fixed inset-0 bg-accent-coral/10 border-4 border-dashed border-accent-coral z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                        <Paperclip size={48} className="text-accent-coral mx-auto mb-4" />
                        <p className="text-xl font-bold text-text-coffee">Drop your file here</p>
                        <p className="text-stone-500">PDF, images, videos, markdown</p>
                    </div>
                </div>
            )}

            <main className="flex-grow px-4 md:px-8 py-8 max-w-3xl mx-auto w-full flex flex-col">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mb-4">
                        <Robot size={20} weight="fill" className="text-accent-coral" />
                        <span className="font-bold text-accent-coral">Solance AI</span>
                    </div>
                    <h1 className="text-3xl font-bold text-text-coffee">Create Your Course</h1>
                    <p className="text-stone-500 mt-2">Tell me what you want to learn, and I'll design a curriculum just for you.</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3">
                        <Warning size={20} weight="fill" className="mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold">Error</p>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-grow overflow-y-auto space-y-6 mb-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' ? (
                                <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border border-stone-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                                            <Robot size={14} weight="fill" className="text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-stone-600">Solance AI</span>
                                    </div>
                                    <div className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                                        {message.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                                            part.startsWith('**') && part.endsWith('**')
                                                ? <strong key={i}>{part.slice(2, -2)}</strong>
                                                : part.split(/(\*.*?\*)/).map((subpart, j) =>
                                                    subpart.startsWith('*') && subpart.endsWith('*') && !subpart.startsWith('**')
                                                        ? <em key={`${i}-${j}`}>{subpart.slice(1, -1)}</em>
                                                        : subpart
                                                )
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-[85%]">
                                    {message.file && (
                                        <div className="flex justify-end mb-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-stone-100 rounded-lg text-sm text-stone-600">
                                                {getFileIcon(message.file.type)}
                                                <span className="max-w-[150px] truncate">{message.file.name}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl rounded-tr-md p-4 shadow-sm">
                                        <div className="leading-relaxed">{message.content}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border border-stone-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                                        <Robot size={14} weight="fill" className="text-white" />
                                    </div>
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="sticky bottom-0 bg-gradient-to-t from-[#FFF8F3] via-[#FFF8F3] to-transparent pt-4">
                    {/* Pending file preview */}
                    {pendingFile && (
                        <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-xl">
                            {isUploading ? (
                                <span className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                            ) : (
                                getFileIcon(pendingFile.type)
                            )}
                            <span className="flex-1 text-sm text-stone-600 truncate">{pendingFile.name}</span>
                            {!isUploading && (
                                <button onClick={clearFile} className="text-stone-400 hover:text-stone-600">
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 items-end">
                        {/* File upload button */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={SUPPORTED_TYPES.join(',')}
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="p-3 bg-white rounded-xl border border-stone-200 text-stone-500 hover:text-accent-coral hover:border-accent-coral transition-colors disabled:opacity-50"
                        >
                            <Paperclip size={22} />
                        </button>

                        {/* Text input */}
                        <div className="flex-1 bg-white rounded-xl border border-stone-200 focus-within:border-accent-coral transition-colors">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Tell me what you want to learn..."
                                rows={1}
                                className="w-full px-4 py-3 bg-transparent outline-none resize-none text-stone-700 placeholder:text-stone-400"
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                            />
                        </div>

                        {/* Send button */}
                        <button
                            onClick={handleSend}
                            disabled={(!inputValue.trim() && !uploadedFile) || isLoading}
                            className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
                        >
                            <PaperPlaneRight size={22} weight="fill" />
                        </button>
                    </div>

                    <p className="text-center text-xs text-stone-400 mt-3">
                        Drag and drop files or click the attachment icon to upload PDFs, images, videos, or documents.
                    </p>
                </div>
            </main>
        </div>
    );
}
