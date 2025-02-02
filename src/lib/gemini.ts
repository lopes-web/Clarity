import { GoogleGenerativeAI } from "@google/generative-ai";

const ZOOTECNIA_CONTEXT = `Você é um assistente especializado em Zootecnia.

Ao responder:
1. Use títulos centralizados
2. Comece com uma breve definição do tema
3. Liste os pontos principais em tópicos claros
4. Use linguagem simples e direta
5. Mantenha parágrafos curtos
6. Inclua referências quando possível`;

type FileData = {
  data: string;
  mimeType: string;
};

export class GeminiService {
  private model;
  private visionModel;
  private chat;
  private apiKey: string;
  private chatHistory: { role: string; parts: { text: string }[] }[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    try {
      console.log("Inicializando GeminiService com a chave:", apiKey);
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Modelo principal
      this.model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        }
      });

      // Modelo para análise de imagens
      this.visionModel = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        }
      });

      // Inicializa o histórico com o contexto de Zootecnia
      this.chatHistory = [
        {
          role: "user",
          parts: [{ text: "Por favor, atue como um especialista em Zootecnia e mantenha suas respostas simples e bem organizadas." }]
        },
        {
          role: "model",
          parts: [{ text: ZOOTECNIA_CONTEXT }]
        }
      ];

      // Inicia o chat com o histórico
      this.chat = this.model.startChat({
        history: this.chatHistory,
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        }
      });

      console.log("GeminiService inicializado com sucesso!");
    } catch (error) {
      console.error("Erro detalhado ao inicializar GeminiService:", error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    console.error("Erro detalhado:", error);
    
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return new Error("Modelo não disponível. Tentando modelo alternativo...");
    }
    if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
      return new Error("Por favor, reformule sua pergunta focando em aspectos técnicos da Zootecnia.");
    }
    if (errorMessage.includes('api_key')) {
      return new Error("Erro de autenticação. Verifique sua chave de API.");
    }
    if (errorMessage.includes('quota')) {
      return new Error("Limite de uso atingido. Tente novamente mais tarde.");
    }
    
    return new Error("Ocorreu um erro. Por favor, tente novamente.");
  }

  private async fileToGenerativePart(file: File): Promise<FileData> {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const base64EncodedData = await base64EncodedDataPromise;
    const mimeType = file.type;

    return {
      data: base64EncodedData.split(',')[1],
      mimeType
    };
  }

  private async analyzeImage(image: File, prompt: string): Promise<string> {
    try {
      const imagePart = await this.fileToGenerativePart(image);
      
      // Adiciona contexto específico para análise de imagens de zootecnia
      const contextualizedPrompt = `Como especialista em Zootecnia, analise esta imagem considerando:
1. Espécie e raça do animal
2. Características físicas visíveis
3. Condição corporal
4. Aspectos relevantes do ambiente
5. Possíveis observações técnicas

${prompt}`;

      const result = await this.visionModel.generateContent([
        {
          text: contextualizedPrompt
        },
        {
          inlineData: {
            mimeType: imagePart.mimeType,
            data: imagePart.data
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text();

      // Adiciona a análise da imagem ao histórico
      this.chatHistory.push(
        { role: "user", parts: [{ text: `[Imagem enviada] ${prompt}` }] },
        { role: "model", parts: [{ text }] }
      );

      return text;
    } catch (error) {
      console.error("Erro ao analisar imagem:", error);
      throw this.handleError(error);
    }
  }

  async sendMessage(message: string, image?: File): Promise<string> {
    try {
      console.log("Enviando mensagem:", message);
      
      // Se tiver imagem para análise
      if (image) {
        return this.analyzeImage(image, message);
      }

      // Chat normal
      const formattedMessage = `${message}\n\nPor favor, mantenha a resposta simples e bem organizada.`;
      
      // Adiciona a mensagem do usuário ao histórico
      this.chatHistory.push({
        role: "user",
        parts: [{ text: formattedMessage }]
      });

      // Envia a mensagem com todo o histórico
      const result = await this.model.generateContent([
        { text: formattedMessage }
      ]);
      const response = await result.response;
      const text = response.text();

      // Adiciona a resposta ao histórico
      this.chatHistory.push({
        role: "model",
        parts: [{ text }]
      });

      console.log("Resposta recebida:", text);
      return text;
    } catch (error) {
      console.error("Erro detalhado ao enviar mensagem:", error);
      throw this.handleError(error);
    }
  }

  async testApiConnection(): Promise<boolean> {
    try {
      console.log("Testando conexão com a API...");
      const result = await this.model.generateContent([
        { text: "Quais são as tendências recentes em nutrição de bovinos de corte?" }
      ]);
      const response = await result.response;
      const text = response.text();
      console.log("Resposta do teste:", text);
      return text.length > 0;
    } catch (error) {
      console.error("Erro detalhado ao testar conexão:", error);
      throw this.handleError(error);
    }
  }
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  image?: string; // URL da imagem em base64
}; 