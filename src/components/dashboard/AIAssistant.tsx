import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import { Send, Loader2, Microscope, User, Image as ImageIcon, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { extractTextFromPDF } from '@/lib/pdfService';
import { toast } from "sonner";
import { configurePdfWorker } from '@/lib/pdfjs-config';
import { useGemini } from '@/contexts/GeminiContext';

const TODAS_SUGESTOES_ZOOTECNIA = [
  "Como calcular a taxa de lotação ideal para pastagens?",
  "Quais são os principais indicadores de bem-estar animal?",
  "Explique o manejo nutricional de frangos de corte.",
  "Como avaliar a qualidade de uma silagem?",
  "Técnicas de reprodução em bovinos.",
  "Quais são as principais vacinas para gado de corte?",
  "Como fazer o manejo sanitário de ovinos?",
  "Explique os sistemas de pastejo rotacionado.",
  "Quais são as principais raças leiteiras e suas características?",
  "Como calcular a conversão alimentar em suínos?",
  "Métodos de conservação de forragens.",
  "Como avaliar a condição corporal do rebanho?"
];

const NUMERO_SUGESTOES = 6;

export function AIAssistant() {
  const { apiKey } = useGemini();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const { messages, isLoading, error, sendMessage } = useGeminiChat(apiKey);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sugestoesAtuais, setSugestoesAtuais] = useState<string[]>([]);

  useEffect(() => {
    configurePdfWorker();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Embaralha e seleciona 6 sugestões aleatórias quando o componente monta
    const sugestoesEmbaralhadas = [...TODAS_SUGESTOES_ZOOTECNIA]
      .sort(() => Math.random() - 0.5)
      .slice(0, NUMERO_SUGESTOES);
    setSugestoesAtuais(sugestoesEmbaralhadas);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      await sendMessage(input, selectedImage);
      setInput('');
      setSelectedImage(null);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        await handleSubmit(e as any);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("O PDF deve ter menos de 10MB");
        return;
      }

      try {
        setIsPdfLoading(true);
        const text = await extractTextFromPDF(file);
        await sendMessage(`Por favor, analise este PDF sobre Zootecnia:\n\n${text}`);
      } catch (error) {
        toast.error("Erro ao processar o PDF");
        console.error(error);
      } finally {
        setIsPdfLoading(false);
      }
    } else if (file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("A imagem deve ter menos de 5MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleSugestaoClick = async (sugestao: string) => {
    if (!isLoading) {
      setInput(sugestao);
      await sendMessage(sugestao);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col bg-background border-border">
      <CardHeader className="p-4 border-b border-border space-y-1 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
            <Microscope className="w-5 h-5 text-accent" />
            Assistente de Zootecnia
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4 min-h-[400px]">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3 text-sm",
                  message.role === 'assistant' ? 'items-start' : 'items-start justify-end'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Microscope className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 max-w-[85%]",
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
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <User className="w-4 w-4 text-accent-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="space-y-4 flex-shrink-0">
          {!messages.length && (
            <div className="text-center space-y-6 p-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Sugestões de perguntas</h3>
                <p className="text-sm text-muted-foreground">Selecione uma pergunta ou faça a sua própria</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {sugestoesAtuais.map((sugestao, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 text-left break-words whitespace-normal bg-muted/10 hover:bg-muted/20 text-foreground border-border transition-colors"
                    onClick={() => handleSugestaoClick(sugestao)}
                    disabled={isLoading}
                  >
                    <span className="text-sm">{sugestao}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
            <div className="flex-1 flex gap-2 min-w-0">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="bg-muted/10 border-border text-foreground placeholder:text-muted-foreground flex-1 min-w-0 h-12"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,application/pdf"
                className="hidden"
              />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isPdfLoading}
                className="border-border hover:bg-muted/20 h-12 w-12"
              >
                {selectedImage ? (
                  <X className="h-4 w-4 text-foreground" onClick={() => setSelectedImage(null)} />
                ) : (
                  <ImageIcon className="h-4 w-4 text-foreground" />
                )}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isPdfLoading}
                className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 w-12"
              >
                {isLoading || isPdfLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
} 