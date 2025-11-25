'use client';

import React, { useEffect, useRef } from 'react';
import { ConversationStep } from '@/types';

interface Message {
  id: string;
  type: 'tutor' | 'student';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  className?: string;
}

const TutorMessage: React.FC<{ content: string; isNew?: boolean }> = ({ 
  content, 
  isNew = false 
}) => {
  return (
    <div className={`flex justify-start mb-6 ${isNew ? 'pop-in' : ''}`}>
      <div className="bubble-card max-w-2xl">
        <div className="flex items-start gap-4">
          {/* Tutor Avatar */}
          <div className="w-12 h-12 bg-accent-sage rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            S
          </div>
          
          {/* Message Content */}
          <div className="flex-1">
            <div className="font-bold text-text-coffee mb-2 text-sm">
              Solance Tutor
            </div>
            <div className="text-text-coffee leading-relaxed">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentMessage: React.FC<{ content: string; isNew?: boolean }> = ({ 
  content, 
  isNew = false 
}) => {
  return (
    <div className={`flex justify-end mb-6 ${isNew ? 'pop-in' : ''}`}>
      <div className="user-bubble max-w-xl">
        <div className="font-semibold">
          {content}
        </div>
      </div>
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  className = '' 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="space-y-0">
        {messages.map((message, index) => {
          const isNew = index === messages.length - 1;
          
          if (message.type === 'tutor') {
            return (
              <TutorMessage 
                key={message.id}
                content={message.content}
                isNew={isNew}
              />
            );
          } else {
            return (
              <StudentMessage 
                key={message.id}
                content={message.content}
                isNew={isNew}
              />
            );
          }
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatInterface;
export type { Message };