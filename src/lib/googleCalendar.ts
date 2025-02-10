import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Escopo necessário para acessar o calendário
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Configuração do cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  window.location.origin + '/auth/google/callback' // URL de redirecionamento
);

// Criar cliente do Calendar
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
};

export const setCredentials = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  // Aqui você pode salvar os tokens no localStorage ou em um estado global
  localStorage.setItem('googleCalendarTokens', JSON.stringify(tokens));
};

export const loadSavedCredentials = () => {
  const tokens = localStorage.getItem('googleCalendarTokens');
  if (tokens) {
    oauth2Client.setCredentials(JSON.parse(tokens));
    return true;
  }
  return false;
};

export const addEventToGoogleCalendar = async (event: {
  title: string;
  date: Date;
  description?: string;
  type: string;
  completed?: boolean;
}) => {
  try {
    const googleEvent = {
      summary: event.title,
      description: `${event.type}${event.description ? ` - ${event.description}` : ''}${event.completed ? ' (Concluído)' : ''}`,
      start: {
        dateTime: event.date.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(event.date.getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      colorId: event.completed ? '8' : '0', // Cinza para concluído, padrão para pendente
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: googleEvent,
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar evento ao Google Calendar:', error);
    throw error;
  }
};

export const syncEventsToGoogle = async (events: Array<{
  title: string;
  date: Date;
  description?: string;
  type: string;
}>) => {
  try {
    const results = await Promise.all(
      events.map(event => addEventToGoogleCalendar(event))
    );
    return results;
  } catch (error) {
    console.error('Erro na sincronização com Google Calendar:', error);
    throw error;
  }
};

export const getGoogleCalendarEvents = async (timeMin: Date = new Date()) => {
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items;
  } catch (error) {
    console.error('Erro ao buscar eventos do Google Calendar:', error);
    throw error;
  }
};

export const updateGoogleEvent = async (eventId: string, event: {
  title: string;
  date: Date;
  description?: string;
  type: string;
  completed: boolean;
}) => {
  try {
    const googleEvent = {
      summary: event.title,
      description: `${event.type}${event.description ? ` - ${event.description}` : ''}${event.completed ? ' (Concluído)' : ''}`,
      start: {
        dateTime: event.date.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(event.date.getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      colorId: event.completed ? '8' : '0', // Cinza para concluído, padrão para pendente
    };

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: googleEvent,
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar evento no Google Calendar:', error);
    throw error;
  }
};

export const deleteGoogleEvent = async (eventId: string) => {
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    return true;
  } catch (error) {
    console.error('Erro ao deletar evento do Google Calendar:', error);
    throw error;
  }
}; 