import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGoogleAuth, isAuthenticated } from "@/lib/googleCalendar";
import { toast } from "sonner";
import { Calendar, LogOut } from "lucide-react";

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

      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      setRetryCount(prev => prev + 1);
      
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

  const handleLogout = useCallback(() => {
    localStorage.removeItem('@clarity/google_token');
    window.location.reload();
  }, []);

  if (!isReady) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full max-w-xs"
        disabled
      >
        <Calendar className="w-4 h-4 mr-2 animate-spin" />
        {retryCount > 0 ? `Tentando novamente (${retryCount}/${MAX_RETRIES})...` : 'Inicializando...'}
      </Button>
    );
  }

  if (isAuthenticated()) {
    return (
      <div className="flex gap-2 w-full max-w-xs">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          disabled
        >
          <Calendar className="w-4 h-4 mr-2 text-green-500" />
          Conectado
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="px-3"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="w-full max-w-xs"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Calendar className="w-4 h-4 mr-2 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <Calendar className="w-4 h-4 mr-2" />
          Sincronizar Tarefas
        </>
      )}
    </Button>
  );
};

export default GoogleCalendarButton; 