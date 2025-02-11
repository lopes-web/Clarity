import { Event } from "@/components/EventProvider";
import { useGoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

let accessToken: string | null = null;

export const isAuthenticated = () => {
  return !!accessToken;
};

export const useGoogleAuth = () => {
  return useGoogleLogin({
    onSuccess: (response) => {
      accessToken = response.access_token;
    },
    onError: (error) => {
      console.error('Login Failed:', error);
    },
    scope: 'https://www.googleapis.com/auth/calendar',
  });
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  if (!accessToken) throw new Error('Not authenticated');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
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

  const response = await fetchWithAuth('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify(googleEvent),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
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

  const response = await fetchWithAuth(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(googleEvent),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
};

export const deleteGoogleEvent = async (eventId: string) => {
  await fetchWithAuth(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
  });
};

// Lista eventos do Google Calendar
export const getGoogleCalendarEvents = async (timeMin: Date = new Date()) => {
  try {
    const response = await fetchWithAuth('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.items;
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    throw error;
  }
}; 