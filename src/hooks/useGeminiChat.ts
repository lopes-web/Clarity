import { useState, useCallback, useRef, useEffect } from 'react';
import { GeminiService, ChatMessage } from '@/lib/gemini';

export function useGeminiChat(apiKey: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const geminiRef = useRef<GeminiService | null>(null);

  // Inicializa o serviço assim que o hook é montado
  useEffect(() => {
    if (!geminiRef.current && apiKey) {
      try {
        console.log('Inicializando GeminiService com a chave:', apiKey);
        geminiRef.current = new GeminiService(apiKey);
      } catch (err) {
        console.error('Erro ao inicializar GeminiService:', err);
        setError(err instanceof Error ? err.message : 'Erro ao inicializar o chat');
      }
    }
  }, [apiKey]);

  const sendMessage = useCallback(async (content: string, image?: File) => {
    if (!geminiRef.current && apiKey) {
      try {
        console.log('Reinicializando GeminiService antes de enviar mensagem');
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
        console.log('Processando imagem...');
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
      if (geminiRef.current) {
        console.log('Enviando mensagem para o Gemini:', { content, hasImage: !!image });
        const response = await geminiRef.current.sendMessage(content, image);
        console.log('Resposta recebida do Gemini:', response);

        // Adiciona a resposta do assistente
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response
        }]);
      } else {
        throw new Error('Serviço Gemini não inicializado');
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar sua mensagem');
      // Adiciona mensagem de erro como resposta do assistente
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
      }]);
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