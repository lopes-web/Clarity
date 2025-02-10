import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Event {
  id: string;
  title: string;
  date: Date;
  type: "Prova" | "Trabalho" | "Projeto" | "Aula" | "Outro";
  description?: string;
  disciplina?: string;
}

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => void;
  removeEvent: (id: string) => void;
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

  const addEvent = (eventData: Omit<Event, "id">) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      ...eventData,
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  return (
    <EventContext.Provider value={{ events, addEvent, removeEvent }}>
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