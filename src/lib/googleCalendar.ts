import { gapi } from 'gapi-script';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Escopo necessário para acessar o calendário
const SCOPES = 'https://www.googleapis.com/auth/calendar';

// Inicializa o cliente do Google Calendar
export const initGoogleCalendar = () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        })
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          console.error('Erro ao inicializar Google Calendar:', error);
          reject(error);
        });
    });
  });
};

// Verifica se o usuário está autenticado
export const isAuthenticated = () => {
  return gapi.auth2?.getAuthInstance()?.isSignedIn.get() || false;
};

// Faz login no Google
export const signIn = async () => {
  try {
    const auth = gapi.auth2.getAuthInstance();
    const user = await auth.signIn();
    return user;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

// Adiciona um evento ao Google Calendar
export const addEventToGoogleCalendar = async (event: {
  title: string;
  date: Date;
  description?: string;
  type: string;
  completed?: boolean;
}) => {
  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary: event.title,
        description: `${event.type}${event.description ? ` - ${event.description}` : ''}${
          event.completed ? ' (Concluído)' : ''
        }`,
        start: {
          dateTime: event.date.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(event.date.getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        colorId: event.completed ? '8' : '0',
      },
    });

    return response.result;
  } catch (error) {
    console.error('Erro ao adicionar evento:', error);
    throw error;
  }
};

// Atualiza um evento no Google Calendar
export const updateGoogleEvent = async (
  eventId: string,
  event: {
    title: string;
    date: Date;
    description?: string;
    type: string;
    completed: boolean;
  }
) => {
  try {
    const response = await gapi.client.calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      resource: {
        summary: event.title,
        description: `${event.type}${event.description ? ` - ${event.description}` : ''}${
          event.completed ? ' (Concluído)' : ''
        }`,
        start: {
          dateTime: event.date.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(event.date.getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        colorId: event.completed ? '8' : '0',
      },
    });

    return response.result;
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    throw error;
  }
};

// Remove um evento do Google Calendar
export const deleteGoogleEvent = async (eventId: string) => {
  try {
    await gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    return true;
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    throw error;
  }
};

// Lista eventos do Google Calendar
export const getGoogleCalendarEvents = async (timeMin: Date = new Date()) => {
  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.result.items;
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    throw error;
  }
}; 