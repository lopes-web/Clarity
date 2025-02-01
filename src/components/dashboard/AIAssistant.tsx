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

const SUGESTOES_ZOOTECNIA = [
  "Como calcular a taxa de lotação ideal para pastagens?",
  "Quais são os principais indicadores de bem-estar animal?",
  "Explique o manejo nutricional de frangos de corte.",
  "Como avaliar a qualidade de uma silagem?",
  "Técnicas de reprodução em bovinos."
];

export function AIAssistant() {
  const { apiKey } = useGemini();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const { messages, isLoading, error, sendMessage } = useGeminiChat(apiKey);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    configurePdfWorker();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      await sendMessage(input, selectedImage);
      setInput('');
      setSelectedImage(null);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
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

  const handleSugestaoClick = (sugestao: string) => {
    if (!isLoading) {
      sendMessage(sugestao);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col bg-background">
      <CardHeader className="p-4 border-b space-y-1 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Microscope className="w-5 h-5 text-primary" />
            Assistente de Zootecnia
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col gap-4">
        <ScrollArea className="flex-1 pr-4">
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
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Microscope className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 max-w-[85%]",
                    message.role === 'assistant'
                      ? 'bg-muted'
                      : 'bg-primary text-primary-foreground'
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
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="space-y-4">
          {!messages.length && (
            <div className="text-center space-y-6 p-8">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary">Sugestões de perguntas</h3>
                <p className="text-sm text-muted-foreground">Selecione uma pergunta ou faça a sua própria</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {SUGESTOES_ZOOTECNIA.map((sugestao, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 text-left flex items-center gap-3 hover:bg-primary/5 transition-colors"
                    onClick={() => handleSugestaoClick(sugestao)}
                    disabled={isLoading}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Microscope className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{sugestao}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,application/pdf"
                className="hidden"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isPdfLoading}
              >
                {selectedImage ? (
                  <X className="h-4 w-4" onClick={() => setSelectedImage(null)} />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
              </Button>
              <Button type="submit" disabled={isLoading || isPdfLoading}>
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