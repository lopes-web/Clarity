import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Cliente público para operações normais
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente com permissões de service_role para operações administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type Profile = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

// Tipos para as tabelas do Supabase
export type Tables = {
  profiles: Profile;
  events: {
    id: string;
    user_id: string;
    title: string;
    date: string;
    type: "Prova" | "Trabalho" | "Projeto" | "Aula" | "Outro";
    description?: string;
    disciplina?: string;
    completed: boolean;
    google_event_id?: string;
    created_at: string;
    updated_at: string;
  };
  disciplines: {
    id: string;
    user_id: string;
    name: string;
    professor: string;
    credits: number;
    created_at: string;
    updated_at: string;
  };
  grades: {
    id: string;
    discipline_id: string;
    value: number;
    description: string;
    created_at: string;
    updated_at: string;
  };
}; 