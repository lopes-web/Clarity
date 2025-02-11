import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import {
  addEventToGoogleCalendar,
  updateGoogleEvent,
  deleteGoogleEvent,
  isAuthenticated,
  syncGoogleCalendarEvents
} from "@/lib/googleCalendar";

export interface Event {
  id: string;
  title: string;
  date: Date;
  type: "Prova" | "Trabalho" | "Projeto" | "Aula" | "Outro";
  description?: string;
  disciplina?: string;
  completed: boolean;
  googleEventId?: string;
}

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => void;
  removeEvent: (id: string) => void;
  toggleEventComplete: (id: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const STORAGE_KEY = "@clarity/events";

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(() => {
    const storedEvents = localStorage.getItem(STORAGE_KEY);
    if (storedEvents) {
      const parsedEvents = JSON.parse(storedEvents);
      return parsedEvents.map((event: any) => ({
        ...event,
        date: new Date(event.date),
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  // Efeito para sincronizar com o Google Calendar
  useEffect(() => {
    const syncEvents = async () => {
      if (isAuthenticated()) {
        try {
          const googleEvents = await syncGoogleCalendarEvents();
          
          // Atualizar eventos locais com status do Google Calendar
          setEvents(prevEvents => {
            const updatedEvents = [...prevEvents];
            
            googleEvents.forEach(googleEvent => {
              const localEventIndex = updatedEvents.findIndex(e => e.googleEventId === googleEvent.id);
              if (localEventIndex !== -1) {
                updatedEvents[localEventIndex] = {
                  ...updatedEvents[localEventIndex],
                  completed: googleEvent.completed
                };
              }
            });
            
            return updatedEvents;
          });
        } catch (error) {
          console.error('Erro ao sincronizar com Google Calendar:', error);
        }
      }
    };

    // Sincronizar a cada 5 minutos
    syncEvents();
    const interval = setInterval(syncEvents, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const addEvent = async (eventData: Omit<Event, "id">) => {
    console.log('Iniciando adição de evento:', eventData);
    
    try {
      let googleEventId = undefined;
      
      // Se estiver autenticado no Google, adiciona o evento lá também
      if (isAuthenticated()) {
        console.log('Usuário autenticado, adicionando ao Google Calendar');
        try {
          const googleEvent = await addEventToGoogleCalendar(eventData);
          googleEventId = googleEvent.id;
          console.log('Evento adicionado ao Google Calendar com ID:', googleEventId);
        } catch (error) {
          console.error('Erro ao adicionar evento ao Google Calendar:', error);
          toast.error('Erro ao sincronizar com Google Calendar. O evento será salvo apenas localmente.');
        }
      } else {
        console.log('Usuário não autenticado no Google Calendar');
      }

      const newEvent: Event = {
        id: Date.now().toString(),
        completed: false,
        ...eventData,
        googleEventId,
      };

      console.log('Salvando evento localmente:', newEvent);
      setEvents(prev => [...prev, newEvent]);
      toast.success('Evento adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      toast.error('Erro ao adicionar evento. Tente novamente.');
    }
  };

  const removeEvent = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (event?.googleEventId && isAuthenticated()) {
      try {
        await deleteGoogleEvent(event.googleEventId);
      } catch (error) {
        console.error('Erro ao remover evento do Google Calendar:', error);
      }
    }
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const toggleEventComplete = async (id: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === id) {
        const updatedEvent = { ...event, completed: !event.completed };
        
        if (event.googleEventId && isAuthenticated()) {
          try {
            updateGoogleEvent(event.googleEventId, updatedEvent);
          } catch (error) {
            console.error('Erro ao atualizar evento no Google Calendar:', error);
            toast.error('Erro ao sincronizar com Google Calendar');
          }
        }
        
        return updatedEvent;
      }
      return event;
    }));
  };

  return (
    <EventContext.Provider value={{ events, addEvent, removeEvent, toggleEventComplete }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
} 