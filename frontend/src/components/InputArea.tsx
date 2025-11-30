'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight } from '@phosphor-icons/react';

interface InputAreaProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  placeholder?: string;
  feedbackMessage?: string;
  feedbackType?: 'success' | 'error' | 'hint' | null;
  className?: string;
}

const InputArea: React.FC<InputAreaProps> = ({
  onSubmit,
  disabled = false,
  placeholder = "Type your answer here...",
  feedbackMessage,
  feedbackType = null,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || disabled) return;
    
    onSubmit(inputValue.trim());
    setInputValue('');
    
    // Trigger shake animation for incorrect answers
    if (feedbackType === 'error') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-focus input when component mounts or becomes enabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  // Trigger shake animation when feedback type changes to error
  useEffect(() => {
    if (feedbackType === 'error') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
  }, [feedbackType]);

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      {/* Feedback Message */}
      {feedbackMessage && (
        <div className={`mb-4 text-center transition-all duration-300 ${
          feedbackType === 'success' ? 'text-accent-sage' :
          feedbackType === 'error' ? 'text-accent-coral' :
          feedbackType === 'hint' ? 'text-text-coffee' :
          'text-text-coffee'
        }`}>
          <div className="inline-block bg-white/60 backdrop-blur-sm border border-white rounded-2xl px-6 py-3 shadow-lg">
            <span className="font-semibold">
              {feedbackMessage}
            </span>
          </div>
        </div>
      )}

      {/* Input Container */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className={`cozy-input-container ${isShaking ? 'shake' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
          <div className="flex items-center w-full">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="cozy-input flex-1 px-6 py-4 disabled:cursor-not-allowed text-center"
            />
            
            <button
              type="submit"
              disabled={disabled || !inputValue.trim()}
              className={`fun-btn mr-2 ${
                disabled || !inputValue.trim() 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-110 hover:rotate-12'
              }`}
            >
              <ArrowRight size={24} weight="bold" />
            </button>
          </div>
        </div>
      </form>

      {/* Helper Text */}
      <div className="text-center mt-3 text-xs text-text-coffee/50 font-medium">
        Press Enter or click the arrow to submit your answer
      </div>
    </div>
  );
};

export default InputArea;