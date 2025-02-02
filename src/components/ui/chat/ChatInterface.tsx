import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import { Send, Loader2, Microscope, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const SUGESTOES_ZOOTECNIA = [
  "Como calcular a taxa de lotação ideal para pastagens?",
  "Quais são os principais indicadores de bem-estar animal em bovinos de leite?",
  "Explique o manejo nutricional de frangos de corte nas diferentes fases.",
  "Como avaliar a qualidade de uma silagem de milho?",
  "Quais são as principais técnicas de reprodução em ovinos?"
];

export function ChatInterface({ apiKey }: { apiKey: string }) {
  const [input, setInput] = useState('');
  const { messages, isLoading, error, sendMessage } = useGeminiChat(apiKey);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      await sendMessage(input);
      setInput('');
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  const handleSugestaoClick = (sugestao: string) => {
    if (!isLoading) {
      sendMessage(sugestao);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto h-[700px] flex flex-col bg-background shadow-xl">
      <div className="p-4 border-b bg-muted/30">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Microscope className="w-6 h-6 text-primary" />
          Assistente de Zootecnia
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-base text-center text-muted-foreground">
              Olá! Como posso ajudar com suas dúvidas sobre Zootecnia?
            </p>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {SUGESTOES_ZOOTECNIA.map((sugestao, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto p-4 text-base"
                  onClick={() => handleSugestaoClick(sugestao)}
                >
                  {sugestao}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  <div className="bg-muted rounded-full p-1">
                    <Microscope className="w-4 h-4" />
                  </div>
                </div>
              )}
              
              <div
                className={cn(
                  "rounded-lg p-4 text-base leading-relaxed max-w-[90%]",
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted/50 text-foreground'
                )}
              >
                <div className="prose prose-quoteless prose-neutral dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-lg font-semibold text-center mb-4">{children}</h1>
                      ),
                      p: ({ children }) => (
                        <p className="text-base mb-3">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-2 my-3">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-base">{children}</li>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                  <div className="bg-primary rounded-full p-1">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-base">Analisando...</span>
            </div>
          )}
          
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-base">
              {error}
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/30">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Faça uma pergunta sobre Zootecnia..."
            disabled={isLoading}
            className="flex-1 text-base"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
} 