import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useGoogleAuth, isAuthenticated } from "@/lib/googleCalendar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const GoogleCalendarButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const login = useGoogleAuth();

  const handleClick = useCallback(async () => {
    if (isLoading) return;

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
  }, [isLoading, login]);

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