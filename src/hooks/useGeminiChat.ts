import { useState, useCallback, useRef, useEffect } from 'react';
import { GeminiService, ChatMessage } from '@/lib/gemini';

export function useGeminiChat(apiKey: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const geminiRef = useRef<GeminiService | null>(null);

  useEffect(() => {
    if (apiKey && !geminiRef.current) {
      try {
        geminiRef.current = new GeminiService(apiKey);
      } catch (err) {
        console.error('Erro ao inicializar GeminiService:', err);
        setError(err instanceof Error ? err.message : 'Erro ao inicializar o chat');
      }
    }
  }, [apiKey]);

  const sendMessage = useCallback(async (content: string, image?: File) => {
    if (!apiKey) {
      setError('Chave da API não configurada');
      return;
    }

    if (!geminiRef.current) {
      try {
        geminiRef.current = new GeminiService(apiKey);
      } catch (err) {
        console.error('Erro ao inicializar GeminiService:', err);
        setError(err instanceof Error ? err.message : 'Erro ao inicializar o chat');
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Se tiver imagem, converte para base64
      let imageDataUrl: string | undefined;
      if (image) {
        const reader = new FileReader();
        imageDataUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(image);
        });
      }

      // Adiciona a mensagem do usuário
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        image: imageDataUrl
      };
      setMessages(prev => [...prev, userMessage]);

      // Envia a mensagem para o Gemini
      const response = await geminiRef.current.sendMessage(content, image);

      // Adiciona a resposta do assistente
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar sua mensagem');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  return {
    messages,
    isLoading,
    error,
    sendMessage
  };
} 