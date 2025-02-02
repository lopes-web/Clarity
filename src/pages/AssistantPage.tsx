import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGemini } from '@/contexts/GeminiContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import { Send, Loader2, Microscope, User, Image as ImageIcon, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ChatSession = {
  id: string;
  title: string;
  date: Date;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    image?: string;
    timestamp: Date;
  }>;
};

export function AssistantPage() {
  const navigate = useNavigate();
  const { apiKey } = useGemini();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const { messages, isLoading, sendMessage } = useGeminiChat(apiKey);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!apiKey) {
      navigate('/');
      return;
    }

    // Carregar sessões do localStorage
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      const parsedSessions = parsed.map((s: any) => ({
        ...s,
        date: new Date(s.date),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }));
      setSessions(parsedSessions);
      
      // Se não houver sessão atual, seleciona a mais recente
      if (!currentSession && parsedSessions.length > 0) {
        setCurrentSession(parsedSessions[0]);
      }
    }
  }, [apiKey, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    try {
      if (selectedImage) {
        const defaultPrompt = "Por favor, analise esta imagem de acordo com os aspectos zootécnicos.";
        await sendMessage(input.trim() || defaultPrompt, selectedImage);
      } else {
        await sendMessage(input);
      }
      setInput('');
      setSelectedImage(null);

      // Atualizar a sessão atual com a nova mensagem
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          messages: [
            ...currentSession.messages,
            {
              role: 'user' as const,
              content: input,
              timestamp: new Date(),
              ...(selectedImage && { image: URL.createObjectURL(selectedImage) })
            }
          ]
        };
        setCurrentSession(updatedSession);
        updateSessions(updatedSession);
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter menos de 5MB");
        return;
      }
      setSelectedImage(file);
      if (!input.trim()) {
        setInput("Por favor, analise esta imagem de acordo com os aspectos zootécnicos.");
      }
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nova Conversa',
      date: new Date(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    localStorage.setItem('chatSessions', JSON.stringify([newSession, ...sessions]));
  };

  const updateSessions = (updatedSession: ChatSession) => {
    const newSessions = sessions.map(s => 
      s.id === updatedSession.id ? updatedSession : s
    );
    setSessions(newSessions);
    localStorage.setItem('chatSessions', JSON.stringify(newSessions));
  };

  const selectSession = (session: ChatSession) => {
    setCurrentSession(session);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Cabeçalho */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-muted/20"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Microscope className="w-6 h-6 text-accent" />
            Assistente de Zootecnia
          </h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Área do chat */}
        <div className="flex-1 flex flex-col p-4 gap-4">
          <ScrollArea className="flex-1">
            <div className="space-y-4 pb-4 px-4">
              {currentSession?.messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3",
                    message.role === 'assistant' ? 'items-start' : 'items-start justify-end'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Microscope className="w-5 h-5 text-accent" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%]",
                      message.role === 'assistant'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-accent text-accent-foreground'
                    )}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Imagem enviada"
                        className="max-w-full h-auto rounded-lg mb-2"
                      />
                    )}
                    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <Microscope className="w-5 h-5 text-accent" />
                  </div>
                  <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce" />
                      </div>
                      <span className="text-sm">Gerando resposta...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="px-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  className="flex-1 bg-muted/10 border-border text-foreground placeholder:text-muted-foreground"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="border-border hover:bg-muted/20"
                >
                  {selectedImage ? (
                    <X className="h-4 w-4 text-foreground" onClick={() => setSelectedImage(null)} />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-foreground" />
                  )}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Histórico na direita */}
        <div className="w-64 border-l border-border flex flex-col bg-muted/5">
          <div className="p-4 border-b border-border">
            <Button 
              onClick={createNewSession}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Nova Conversa
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {sessions.map(session => (
                <Card 
                  key={session.id}
                  onClick={() => selectSession(session)}
                  className={cn(
                    "p-3 cursor-pointer transition-colors hover:bg-muted/50",
                    currentSession?.id === session.id && "bg-muted"
                  )}
                >
                  <h3 className="font-medium text-sm text-foreground truncate">
                    {session.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(session.date, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 