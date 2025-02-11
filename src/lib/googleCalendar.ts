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

const STORAGE_KEY = '@clarity/google_token';

const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem(STORAGE_KEY),
  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ accessToken: token });
  },
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
    scope: 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/tasks.readonly',
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

// Primeiro, precisamos obter ou criar uma tasklist
const getOrCreateTaskList = async () => {
  try {
    // Tenta obter a tasklist existente
    const response = await fetchWithAuth('https://tasks.googleapis.com/tasks/v1/users/@me/lists');
    let taskList = response.items?.find(list => list.title === 'Clarity');

    // Se não existir, cria uma nova
    if (!taskList) {
      taskList = await fetchWithAuth('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Clarity'
        })
      });
    }

    return taskList.id;
  } catch (error) {
    console.error('Erro ao obter/criar tasklist:', error);
    throw error;
  }
};

export const addEventToGoogleCalendar = async (event: Omit<Event, "id">) => {
  console.log('Preparando tarefa para enviar ao Google Tasks:', event);
  
  try {
    const taskListId = await getOrCreateTaskList();
    
    const googleTask = {
      title: event.title,
      notes: `${event.type}${event.description ? `: ${event.description}` : ''}`,
      due: event.date.toISOString(),
      status: event.completed ? 'completed' : 'needsAction'
    };

    console.log('Tarefa formatada para Google Tasks:', googleTask);

    const response = await fetchWithAuth(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(googleTask),
    });
    
    console.log('Resposta do Google Tasks:', response);
    return response;
  } catch (error) {
    console.error('Erro detalhado ao adicionar tarefa:', error);
    throw error;
  }
};

export const updateGoogleEvent = async (taskId: string, event: Partial<Event>) => {
  try {
    const taskListId = await getOrCreateTaskList();
    
    const googleTask = {
      title: event.title,
      notes: `${event.type}${event.description ? `: ${event.description}` : ''}`,
      due: event.date?.toISOString(),
      status: event.completed ? 'completed' : 'needsAction'
    };

    return fetchWithAuth(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(googleTask),
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    throw error;
  }
};

export const deleteGoogleEvent = async (taskId: string) => {
  try {
    const taskListId = await getOrCreateTaskList();
    await fetchWithAuth(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    throw error;
  }
};

export const getGoogleCalendarEvents = async () => {
  try {
    const taskListId = await getOrCreateTaskList();
    const response = await fetchWithAuth(
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&showHidden=true`
    );
    return response.items || [];
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    throw error;
  }
};

export const syncGoogleCalendarEvents = async () => {
  try {
    const tasks = await getGoogleCalendarEvents();
    const updatedEvents = [];

    for (const task of tasks) {
      updatedEvents.push({
        id: task.id,
        title: task.title,
        date: task.due ? new Date(task.due) : new Date(),
        type: task.notes?.split(':')[0] || 'Outro',
        description: task.notes?.split(':')[1]?.trim(),
        completed: task.status === 'completed'
      });
    }

    return updatedEvents;
  } catch (error) {
    console.error('Erro ao sincronizar tarefas:', error);
    throw error;
  }
}; 