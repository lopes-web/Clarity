import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAuthUrl, setCredentials, loadSavedCredentials, syncEventsToGoogle } from "@/lib/googleCalendar";
import { useEvents } from "@/components/EventProvider";

const GoogleCalendarButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { events } = useEvents();

  const handleGoogleAuth = async () => {
    try {
      setIsSyncing(true);

      // Verificar se já temos credenciais salvas
      if (!loadSavedCredentials()) {
        // Se não tiver credenciais, redirecionar para autenticação
        const authUrl = getAuthUrl();
        window.location.href = authUrl;
        return;
      }

      // Filtrar apenas eventos não completados
      const activeEvents = events.filter(event => !event.completed);
      
      // Sincronizar eventos com o Google Calendar
      await syncEventsToGoogle(activeEvents);

      toast({
        title: "Sincronização concluída",
        description: `${activeEvents.length} eventos foram sincronizados com o Google Calendar.`,
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        variant: "destructive",
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar com o Google Calendar. Tente novamente.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGoogleAuth}
      disabled={isSyncing}
      className="text-xs"
    >
      <CalendarIcon className="w-4 h-4 mr-1" />
      {isSyncing ? "Sincronizando..." : "Sincronizar com Google"}
    </Button>
  );
};

export default GoogleCalendarButton; 