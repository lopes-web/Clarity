import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  addEventToGoogleCalendar, 
  loadSavedCredentials, 
  updateGoogleEvent,
  deleteGoogleEvent
} from "@/lib/googleCalendar";

export interface Event {
  id: string;
  title: string;
  date: Date;
  type: "Prova" | "Trabalho" | "Projeto" | "Aula" | "Outro";
  description?: string;
  disciplina?: string;
  completed: boolean;
  googleEventId?: string; // ID do evento no Google Calendar
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
    // Carrega os eventos do localStorage durante a inicialização
    const storedEvents = localStorage.getItem(STORAGE_KEY);
    if (storedEvents) {
      const parsedEvents = JSON.parse(storedEvents);
      // Converte as strings de data de volta para objetos Date
      return parsedEvents.map((event: any) => ({
        ...event,
        date: new Date(event.date),
      }));
    }
    return [];
  });

  // Salva os eventos no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  // Sincroniza com o Google Calendar quando houver mudanças
  const syncWithGoogle = async (event: Omit<Event, "id">) => {
    if (loadSavedCredentials()) {
      try {
        const googleEvent = await addEventToGoogleCalendar(event);
        return googleEvent.id; // Retorna o ID do evento no Google Calendar
      } catch (error) {
        console.error('Erro ao sincronizar com Google Calendar:', error);
      }
    }
    return null;
  };

  const addEvent = async (eventData: Omit<Event, "id">) => {
    // Primeiro, tenta sincronizar com o Google Calendar
    const googleEventId = await syncWithGoogle(eventData);
    
    const newEvent: Event = {
      id: Date.now().toString(),
      completed: false,
      ...eventData,
      googleEventId, // Salva o ID do evento do Google
    };
    
    setEvents(prev => [...prev, newEvent]);
  };

  const removeEvent = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (event?.googleEventId && loadSavedCredentials()) {
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
        
        // Atualizar status no Google Calendar
        if (event.googleEventId && loadSavedCredentials()) {
          try {
            updateGoogleEvent(event.googleEventId, {
              title: event.title,
              date: event.date,
              description: event.description,
              type: event.type,
              completed: !event.completed
            });
          } catch (error) {
            console.error('Erro ao atualizar evento no Google Calendar:', error);
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