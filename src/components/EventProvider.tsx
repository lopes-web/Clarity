import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import {
  addTaskToGoogle,
  updateGoogleTask,
  deleteGoogleTask,
  isAuthenticated,
  syncGoogleTasks
} from "@/lib/googleCalendar";

export interface Event {
  id: string;
  title: string;
  date: Date;
  type: "Prova" | "Trabalho" | "Projeto" | "Aula" | "Outro";
  description?: string;
  disciplina?: string;
  completed: boolean;
  googleTaskId?: string;
}

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  toggleEventComplete: (id: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();

  // Carregar eventos do Supabase ao iniciar
  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const formattedEvents = data.map(event => ({
        ...event,
        id: event.id,
        date: new Date(event.date),
        googleTaskId: event.google_event_id
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos');
    }
  };

  // Efeito para sincronizar com o Google Tasks
  useEffect(() => {
    const syncEvents = async () => {
      if (isAuthenticated()) {
        try {
          const googleTasks = await syncGoogleTasks();
          
          // Atualizar eventos locais com status do Google Tasks
          setEvents(prevEvents => {
            const updatedEvents = [...prevEvents];
            
            googleTasks.forEach(googleTask => {
              const localEventIndex = updatedEvents.findIndex(e => e.googleTaskId === googleTask.id);
              if (localEventIndex !== -1) {
                updatedEvents[localEventIndex] = {
                  ...updatedEvents[localEventIndex],
                  completed: googleTask.completed
                };
              }
            });
            
            return updatedEvents;
          });
        } catch (error) {
          console.error('Erro ao sincronizar com Google Tasks:', error);
        }
      }
    };

    // Sincronizar a cada 5 minutos
    syncEvents();
    const interval = setInterval(syncEvents, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const addEvent = async (eventData: Omit<Event, "id">) => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar eventos');
      return;
    }

    try {
      let googleTaskId = undefined;
      
      // Se estiver autenticado no Google, adiciona a tarefa lá também
      if (isAuthenticated()) {
        try {
          const googleTask = await addTaskToGoogle(eventData);
          googleTaskId = googleTask.id;
        } catch (error) {
          console.error('Erro ao adicionar tarefa ao Google Tasks:', error);
          toast.error('Erro ao sincronizar com Google Tasks. O evento será salvo apenas localmente.');
        }
      }

      // Salvar no Supabase
      const { data, error } = await supabase
        .from('events')
        .insert([{
          user_id: user.id,
          title: eventData.title,
          date: eventData.date.toISOString(),
          type: eventData.type,
          description: eventData.description,
          disciplina: eventData.disciplina,
          completed: false,
          google_event_id: googleTaskId
        }])
        .select()
        .single();

      if (error) throw error;

      const newEvent: Event = {
        ...data,
        id: data.id,
        date: new Date(data.date),
        googleTaskId: data.google_event_id
      };

      setEvents(prev => [...prev, newEvent]);
      toast.success('Evento adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      toast.error('Erro ao adicionar evento. Tente novamente.');
    }
  };

  const removeEvent = async (id: string) => {
    try {
      const event = events.find(e => e.id === id);
      
      // Remover do Google Tasks se existir
      if (event?.googleTaskId && isAuthenticated()) {
        try {
          await deleteGoogleTask(event.googleTaskId);
        } catch (error) {
          console.error('Erro ao remover tarefa do Google Tasks:', error);
        }
      }

      // Remover do Supabase
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success('Evento removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover evento:', error);
      toast.error('Erro ao remover evento');
    }
  };

  const toggleEventComplete = async (id: string) => {
    try {
      const event = events.find(e => e.id === id);
      if (!event) return;

      const newStatus = !event.completed;

      // Atualizar no Supabase
      const { error } = await supabase
        .from('events')
        .update({ completed: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Atualizar no Google Tasks se existir
      if (event.googleTaskId && isAuthenticated()) {
        try {
          await updateGoogleTask(event.googleTaskId, { ...event, completed: newStatus });
        } catch (error) {
          console.error('Erro ao atualizar tarefa no Google Tasks:', error);
          toast.error('Erro ao sincronizar com Google Tasks');
        }
      }

      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, completed: newStatus } : event
      ));
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao atualizar evento');
    }
  };

  return (
    <EventContext.Provider value={{ events, addEvent, removeEvent, toggleEventComplete }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}; 