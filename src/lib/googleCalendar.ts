import { Event } from "@/components/EventProvider";
import { useGoogleLogin } from '@react-oauth/google';
import { create } from 'zustand';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  throw new Error('VITE_GOOGLE_CLIENT_ID is not defined in environment variables');
}

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
}));

export const isAuthenticated = () => {
  return !!useAuthStore.getState().accessToken;
};

export const useGoogleAuth = () => {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useGoogleLogin({
    onSuccess: (response) => {
      console.log('Login successful, token received');
      setAccessToken(response.access_token);
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setAccessToken(null);
    },
    scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar',
    flow: 'implicit',
    prompt: 'consent'
  });
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) {
    console.error('Token de acesso não encontrado');
    throw new Error('Not authenticated');
  }

  try {
    console.log('Iniciando requisição para:', url);
    console.log('Método:', options.method);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorData
      });

      if (response.status === 401) {
        useAuthStore.getState().setAccessToken(null);
        throw new Error('Authentication expired');
      }
      throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Resposta bem-sucedida:', data);
    return data;
  } catch (error) {
    console.error('Falha na requisição:', error);
    throw error;
  }
};

export const addEventToGoogleCalendar = async (event: Omit<Event, "id">) => {
  console.log('Preparando evento para enviar ao Google Calendar:', event);
  
  const googleEvent = {
    summary: event.title,
    description: `${event.type}${event.description ? `: ${event.description}` : ''}`,
    start: {
      dateTime: event.date.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: new Date(event.date.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  console.log('Evento formatado para Google Calendar:', googleEvent);
  console.log('Token de acesso presente:', !!useAuthStore.getState().accessToken);

  try {
    const response = await fetchWithAuth('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      body: JSON.stringify(googleEvent),
    });
    
    console.log('Resposta do Google Calendar:', response);
    return response;
  } catch (error) {
    console.error('Erro detalhado ao adicionar evento:', error);
    throw error;
  }
};

export const updateGoogleEvent = async (eventId: string, event: Partial<Event>) => {
  const googleEvent = {
    summary: event.title,
    description: `${event.type}${event.description ? `: ${event.description}` : ''}`,
    start: event.date && {
      dateTime: event.date.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: event.date && {
      dateTime: new Date(event.date.getTime() + 60 * 60 * 1000).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  return fetchWithAuth(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(googleEvent),
  });
};

export const deleteGoogleEvent = async (eventId: string) => {
  await fetchWithAuth(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
  });
};

export const getGoogleCalendarEvents = async (timeMin: Date = new Date()) => {
  try {
    const response = await fetchWithAuth(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&maxResults=100&singleEvents=true&orderBy=startTime`
    );
    return response.items;
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    throw error;
  }
}; 