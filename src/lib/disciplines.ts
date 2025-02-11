import { supabase } from './supabase';

export interface Discipline {
  id: string;
  user_id: string;
  name: string;
  professor: string;
  credits: number;
  grade: number;
  absences: number;
  progress: number;
  status: string;
  created_at: string;
  updated_at: string;
  grades?: Grade[];
}

export interface Grade {
  id: string;
  discipline_id: string;
  value: number;
  description: string;
  created_at: string;
  updated_at: string;
}

// Buscar todas as disciplinas do usuário
export const getDisciplines = async (userId: string): Promise<Discipline[]> => {
  const { data, error } = await supabase
    .from('disciplines')
    .select(`
      *,
      grades (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar disciplinas:', error);
    throw error;
  }

  return data || [];
};

// Adicionar uma nova disciplina
export const addDiscipline = async (userId: string, discipline: Omit<Discipline, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('disciplines')
    .insert([
      {
        user_id: userId,
        ...discipline
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar disciplina:', error);
    throw error;
  }

  return data;
};

// Atualizar uma disciplina
export const updateDiscipline = async (disciplineId: string, updates: Partial<Discipline>) => {
  const { data, error } = await supabase
    .from('disciplines')
    .update(updates)
    .eq('id', disciplineId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar disciplina:', error);
    throw error;
  }

  return data;
};

// Deletar uma disciplina
export const deleteDiscipline = async (disciplineId: string) => {
  const { error } = await supabase
    .from('disciplines')
    .delete()
    .eq('id', disciplineId);

  if (error) {
    console.error('Erro ao deletar disciplina:', error);
    throw error;
  }
};

// Adicionar uma nota
export const addGrade = async (grade: Omit<Grade, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('grades')
    .insert([grade])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar nota:', error);
    throw error;
  }

  return data;
};

// Calcular média das notas
export const calculateAverageGrade = (grades: Grade[]) => {
  if (grades.length === 0) return 0;
  const sum = grades.reduce((acc, grade) => acc + grade.value, 0);
  return Number((sum / grades.length).toFixed(1));
}; 