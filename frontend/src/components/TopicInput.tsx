'use client';

import { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  placeholder?: string;
}

export default function TopicInput({ onSubmit, placeholder = "What do you want to learn today?" }: TopicInputProps) {
  const [topic, setTopic] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
    
    // Show hackathon constraint toast for non-algebra topics
    const isAlgebra = /algebra|equation|polynomial|quadratic|linear|math/i.test(e.target.value);
    if (e.target.value.trim() && !isAlgebra) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      setShowToast(false);
    }
  };

  return (
    <div className="relative">
      {/* Hackathon Constraint Toast */}
      <div className={`hackathon-toast ${showToast ? 'show' : ''}`}>
        We are only supporting "algebra" as of now!
      </div>

      {/* Topic Input Container */}
      <form onSubmit={handleSubmit} className="omnibar-container">
        <input
          type="text"
          value={topic}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="omnibar-input"
          autoComplete="off"
        />
        
        <button
          type="submit"
          className="go-btn"
          disabled={!topic.trim()}
        >
          <ArrowRight size={24} weight="bold" />
        </button>
      </form>
    </div>
  );
}