import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import { Send, Loader2, Microscope, User, Settings, Image as ImageIcon, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { extractTextFromPDF } from '@/lib/pdfService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { configurePdfWorker } from '@/lib/pdfjs-config';

const SUGESTOES_ZOOTECNIA = [
  "Como calcular a taxa de lotação ideal para pastagens?",
  "Quais são os principais indicadores de bem-estar animal?",
  "Explique o manejo nutricional de frangos de corte.",
  "Como avaliar a qualidade de uma silagem?",
  "Técnicas de reprodução em bovinos."
];

const API_KEY_STORAGE = 'gemini_api_key';

export function AIAssistant() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  });
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
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

    if (!apiKey) {
      setIsConfigOpen(true);
      return;
    }

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
    if (!apiKey) {
      setIsConfigOpen(true);
      return;
    }

    if (!isLoading) {
      sendMessage(sugestao);
    }
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(API_KEY_STORAGE, apiKey);
    setIsConfigOpen(false);
    toast.success("Chave da API configurada com sucesso!");
  };

  return (
    <Card className="w-full h-full flex flex-col bg-background">
      <CardHeader className="p-4 border-b space-y-1 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Microscope className="w-5 h-5 text-primary" />
            Assistente de Zootecnia
          </CardTitle>
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar API Gemini</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleApiKeySubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="apiKey" className="text-sm font-medium">
                    Chave da API
                  </label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Cole sua chave da API aqui"
                    className="w-full"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Salvar Configuração
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-base text-center text-muted-foreground">
                Olá! Como posso ajudar com suas dúvidas sobre Zootecnia?
              </p>
              <div className="grid grid-cols-1 gap-2">
                {SUGESTOES_ZOOTECNIA.map((sugestao, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left h-auto p-3 text-sm"
                    onClick={() => handleSugestaoClick(sugestao)}
                  >
                    {sugestao}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    <div className="bg-muted rounded-full p-1">
                      <Microscope className="w-4 h-4" />
                    </div>
                  </div>
                )}
                
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm leading-relaxed max-w-[85%] break-words",
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted/50 text-foreground'
                  )}
                >
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Imagem enviada"
                      className="max-w-full h-auto rounded-lg mb-2"
                    />
                  )}
                  <div className="prose prose-sm dark:prose-invert max-w-none overflow-hidden">
                    <ReactMarkdown className="whitespace-pre-wrap">
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    <div className="bg-primary rounded-full p-1">
                      <User className="w-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {(isLoading || isPdfLoading) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {isPdfLoading ? "Processando PDF..." : "Analisando..."}
                </span>
              </div>
            )}
            
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t mt-auto flex-shrink-0">
          <form onSubmit={handleSubmit} className="space-y-2">
            {selectedImage && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm truncate flex-1">
                  {selectedImage.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={apiKey ? "Faça uma pergunta sobre Zootecnia..." : "Configure a API para começar"}
                disabled={isLoading || isPdfLoading || !apiKey}
                className="text-sm"
              />
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isLoading || isPdfLoading || !apiKey}
                onClick={() => fileInputRef.current?.click()}
                title="Enviar imagem ou PDF"
              >
                {selectedImage ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isPdfLoading || !input.trim()}
                size="icon"
                className="shrink-0"
              >
                {(isLoading || isPdfLoading) ? (
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