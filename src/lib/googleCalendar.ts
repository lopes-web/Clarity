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
      setAccessToken(response.access_token);
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setAccessToken(null);
    },
    scope: 'https://www.googleapis.com/auth/calendar',
    flow: 'implicit',
    prompt: 'consent',
    hosted_domain: window.location.hostname,
  });
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) throw new Error('Not authenticated');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().setAccessToken(null);
      throw new Error('Authentication expired');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const addEventToGoogleCalendar = async (event: Omit<Event, "id">) => {
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

  return fetchWithAuth('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify(googleEvent),
  });
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