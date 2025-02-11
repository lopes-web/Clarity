import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGoogleAuth, isAuthenticated } from "@/lib/googleCalendar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: any;
      };
    };
  }
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const GoogleCalendarButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const login = useGoogleAuth();

  useEffect(() => {
    const checkGoogleInit = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    const initializeGoogleAuth = async () => {
      if (checkGoogleInit()) return;

      if (retryCount >= MAX_RETRIES) {
        console.error('Falha ao inicializar Google OAuth após várias tentativas');
        toast.error('Erro ao inicializar Google OAuth. Por favor, recarregue a página.');
        return;
      }

      // Aguarda um tempo antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      setRetryCount(prev => prev + 1);
      
      // Verifica novamente
      if (!checkGoogleInit()) {
        initializeGoogleAuth();
      }
    };

    initializeGoogleAuth();

    return () => {
      setIsReady(false);
      setRetryCount(0);
    };
  }, [retryCount]);

  const handleClick = useCallback(async () => {
    if (isLoading || !isReady) return;

    try {
      setIsLoading(true);
      if (!isAuthenticated()) {
        await login();
        toast.success('Conectado ao Google Calendar com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao autenticar com Google Calendar:', error);
      toast.error('Erro ao conectar com Google Calendar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isReady, login]);

  if (!isReady) {
    return (
      <Button
        variant="outline"
        className="w-full"
        disabled
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        {retryCount > 0 ? `Tentando novamente (${retryCount}/${MAX_RETRIES})...` : 'Inicializando...'}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="w-full"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Conectando...
        </>
      ) : (
        isAuthenticated() ? "Conectado ao Google Calendar" : "Sincronizar com Google"
      )}
    </Button>
  );
};

export default GoogleCalendarButton; 