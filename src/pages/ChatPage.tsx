import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { useGemini } from '@/contexts/GeminiContext';

export function ChatPage() {
  const navigate = useNavigate();
  const { apiKey } = useGemini();

  useEffect(() => {
    if (!apiKey) {
      navigate('/');
    }
  }, [apiKey, navigate]);

  return <AIAssistant />;
} 