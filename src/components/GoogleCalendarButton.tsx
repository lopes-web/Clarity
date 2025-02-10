import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { initGoogleCalendar, isAuthenticated, signIn, addEventToGoogleCalendar } from "@/lib/googleCalendar";
import { useEvents } from "@/components/EventProvider";

const GoogleCalendarButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const { events } = useEvents();

  useEffect(() => {
    initGoogleCalendar()
      .then(() => setIsInitialized(true))
      .catch((error) => {
        console.error('Erro ao inicializar Google Calendar:', error);
        toast({
          variant: "destructive",
          title: "Erro de inicialização",
          description: "Não foi possível inicializar o Google Calendar.",
        });
      });
  }, []);

  const handleGoogleAuth = async () => {
    if (!isInitialized) {
      toast({
        variant: "destructive",
        title: "Aguarde",
        description: "O Google Calendar ainda está sendo inicializado.",
      });
      return;
    }

    try {
      setIsSyncing(true);

      // Se não estiver autenticado, fazer login
      if (!isAuthenticated()) {
        await signIn();
      }

      // Filtrar apenas eventos não completados
      const activeEvents = events.filter(event => !event.completed);
      
      // Sincronizar eventos com o Google Calendar
      for (const event of activeEvents) {
        await addEventToGoogleCalendar(event);
      }

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
      disabled={isSyncing || !isInitialized}
      className="text-xs"
    >
      <CalendarIcon className="w-4 h-4 mr-1" />
      {isSyncing ? "Sincronizando..." : "Sincronizar com Google"}
    </Button>
  );
};

export default GoogleCalendarButton; 