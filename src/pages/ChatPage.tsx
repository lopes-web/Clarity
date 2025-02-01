import { useState } from 'react';
import { ChatInterface } from '@/components/ui/chat/ChatInterface';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { GeminiService } from '@/lib/gemini';

export function ChatPage() {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const gemini = new GeminiService(apiKey);
      const isConnected = await gemini.testApiConnection();

      if (isConnected) {
        setIsConfigured(true);
      } else {
        setError("Não foi possível conectar à API. Verifique sua chave.");
      }
    } catch (err) {
      setError("Erro ao configurar a API. Verifique sua chave e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4">Configurar Chat Gemini</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                Chave da API Gemini
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Cole sua chave da API aqui"
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando conexão...
                </>
              ) : (
                "Começar Chat"
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <ChatInterface apiKey={apiKey} />
    </div>
  );
} 