import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import {
  addEventToGoogleCalendar,
  updateGoogleEvent,
  deleteGoogleEvent,
  isAuthenticated
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

  const addEvent = async (eventData: Omit<Event, "id">) => {
    try {
      let googleEventId = undefined;
      
      // Se estiver autenticado no Google, adiciona o evento lá também
      if (isAuthenticated()) {
        const googleEvent = await addEventToGoogleCalendar(eventData);
        googleEventId = googleEvent.id;
      }

      const newEvent: Event = {
        id: Date.now().toString(),
        completed: false,
        ...eventData,
        googleEventId,
      };

      setEvents(prev => [...prev, newEvent]);
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      // Adiciona o evento localmente mesmo se falhar no Google Calendar
      const newEvent: Event = {
        id: Date.now().toString(),
        completed: false,
        ...eventData,
      };
      setEvents(prev => [...prev, newEvent]);
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