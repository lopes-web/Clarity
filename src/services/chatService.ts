import { supabase, ChatSession, ChatMessage } from '@/lib/supabase';

export const chatService = {
  // Buscar todas as sessões do usuário
  async getSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar sessões:', error);
      throw error;
    }

    return data || [];
  },

  // Criar uma nova sessão
  async createSession(userId: string, title: string): Promise<ChatSession> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([
        {
          user_id: userId,
          title,
          messages: [],
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }

    return data;
  },

  // Atualizar uma sessão existente
  async updateSession(sessionId: string, userId: string, messages: ChatMessage[]): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ messages })
      .eq('id', sessionId)
      .eq('user_id', userId); // Garantir que o usuário só pode atualizar suas próprias sessões

    if (error) {
      console.error('Erro ao atualizar sessão:', error);
      throw error;
    }
  },

  // Deletar uma sessão
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId); // Garantir que o usuário só pode deletar suas próprias sessões

    if (error) {
      console.error('Erro ao deletar sessão:', error);
      throw error;
    }
  },
}; 