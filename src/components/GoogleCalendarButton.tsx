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

const GoogleCalendarButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const login = useGoogleAuth();

  useEffect(() => {
    // Verifica se o Google OAuth está inicializado corretamente
    if (window.google?.accounts?.oauth2) {
      setIsReady(true);
    } else {
      console.error('Google OAuth não está inicializado corretamente');
      toast.error('Erro ao inicializar Google OAuth');
    }
  }, []);

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
        Inicializando...
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