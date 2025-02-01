import { createContext, useContext, ReactNode } from 'react';

interface GeminiContextType {
  apiKey: string;
}

const GeminiContext = createContext<GeminiContextType | undefined>(undefined);

export function GeminiProvider({ children }: { children: ReactNode }) {
  // Chave da API pré-configurada
  const apiKey = 'AIzaSyCBJMS1NRFyQ5qHEq0J9UGNP0yKifBP4CA';

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