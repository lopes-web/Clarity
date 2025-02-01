import { createContext, useContext, ReactNode } from 'react';

interface GeminiContextType {
  apiKey: string;
}

const GeminiContext = createContext<GeminiContextType | undefined>(undefined);

export function GeminiProvider({ children }: { children: ReactNode }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <GeminiContext.Provider value={{ apiKey }}>
      {children}
    </GeminiContext.Provider>
  );
}

export function useGemini() {
  const context = useContext(GeminiContext);
  if (context === undefined) {
    throw new Error('useGemini must be used within a GeminiProvider');
  }
  return context;
} 