'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type ModelMode = 'turbo' | 'deep';

interface ModelModeContextType {
  mode: ModelMode;
  setMode: (mode: ModelMode) => void;
  modelName: string;
}

const ModelModeContext = createContext<ModelModeContextType | undefined>(undefined);

const MODEL_MAP: Record<ModelMode, string> = {
  turbo: 'gemini-2.5-flash',
  deep: 'gemini-2.5-pro',
};

export function ModelModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ModelMode>('deep');

  const modelName = MODEL_MAP[mode];

  return (
    <ModelModeContext.Provider value={{ mode, setMode, modelName }}>
      {children}
    </ModelModeContext.Provider>
  );
}

export function useModelMode() {
  const context = useContext(ModelModeContext);
  if (context === undefined) {
    throw new Error('useModelMode must be used within a ModelModeProvider');
  }
  return context;
}
