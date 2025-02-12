import { supabase } from './supabase';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: AchievementType;
    condition: AchievementCondition;
    xp: number;
    rarity: AchievementRarity;
    unlockedAt?: Date;
}

export type AchievementType =
    | 'GRADE'      // Relacionado a notas
    | 'ATTENDANCE' // Relacionado a presença
    | 'TASK'       // Relacionado a tarefas
    | 'STREAK'     // Relacionado a sequências
    | 'SPECIAL';   // Conquistas especiais

export type AchievementRarity =
    | 'COMMON'    // 50% dos usuários conseguem
    | 'RARE'      // 25% dos usuários conseguem
    | 'EPIC'      // 10% dos usuários conseguem
    | 'LEGENDARY' // 1% dos usuários conseguem

export type AchievementCondition = {
    type: 'GRADE' | 'ATTENDANCE' | 'TASK' | 'STREAK';
    value: number;
    comparison: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN';
};

// Lista de todas as conquistas disponíveis
export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_perfect_grade',
        title: 'Primeira Nota 10! 🌟',
        description: 'Tirou sua primeira nota 10 em uma atividade.',
        icon: '🎯',
        type: 'GRADE',
        condition: { type: 'GRADE', value: 10, comparison: 'EQUALS' },
        xp: 100,
        rarity: 'COMMON'
    },
    {
        id: 'perfect_attendance',
        title: 'Assiduidade Perfeita 📚',
        description: 'Manteve 100% de presença em uma disciplina.',
        icon: '✅',
        type: 'ATTENDANCE',
        condition: { type: 'ATTENDANCE', value: 0, comparison: 'EQUALS' },
        xp: 150,
        rarity: 'RARE'
    },
    {
        id: 'task_master',
        title: 'Mestre das Tarefas 🏆',
        description: 'Completou 10 tarefas antes do prazo.',
        icon: '⚡',
        type: 'TASK',
        condition: { type: 'TASK', value: 10, comparison: 'GREATER_THAN' },
        xp: 200,
        rarity: 'RARE'
    },
    {
        id: 'study_streak',
        title: 'Dedicação Máxima 🔥',
        description: 'Manteve uma sequência de 7 dias completando tarefas.',
        icon: '🔥',
        type: 'STREAK',
        condition: { type: 'STREAK', value: 7, comparison: 'GREATER_THAN' },
        xp: 300,
        rarity: 'EPIC'
    },
    {
        id: 'semester_champion',
        title: 'Campeão do Semestre 👑',
        description: 'Alcançou média geral acima de 9.',
        icon: '👑',
        type: 'GRADE',
        condition: { type: 'GRADE', value: 9, comparison: 'GREATER_THAN' },
        xp: 500,
        rarity: 'LEGENDARY'
    }
];

// Função para verificar se um achievement foi desbloqueado
export const checkAchievement = (achievement: Achievement, value: number): boolean => {
    const { condition } = achievement;

    switch (condition.comparison) {
        case 'EQUALS':
            return value === condition.value;
        case 'GREATER_THAN':
            return value > condition.value;
        case 'LESS_THAN':
            return value < condition.value;
        default:
            return false;
    }
};

// Função para buscar achievements do usuário
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
    const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);

    if (error) {
        console.error('Erro ao buscar achievements:', error);
        return [];
    }

    return ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlockedAt: data?.find(a => a.achievement_id === achievement.id)?.unlocked_at
    }));
};

// Função para desbloquear um achievement
export const unlockAchievement = async (userId: string, achievementId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('user_achievements')
            .insert([
                {
                    user_id: userId,
                    achievement_id: achievementId,
                    unlocked_at: new Date().toISOString()
                }
            ]);

        if (error) throw error;

        // Adicionar XP ao usuário
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (achievement) {
            await addUserXP(userId, achievement.xp);
        }

        return true;
    } catch (error) {
        console.error('Erro ao desbloquear achievement:', error);
        return false;
    }
};

// Função para adicionar XP ao usuário
const addUserXP = async (userId: string, xp: number): Promise<void> => {
    try {
        const { data, error } = await supabase
            .from('user_stats')
            .select('xp')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        const currentXP = data?.xp || 0;
        const newXP = currentXP + xp;

        await supabase
            .from('user_stats')
            .upsert([
                {
                    user_id: userId,
                    xp: newXP,
                    updated_at: new Date().toISOString()
                }
            ]);
    } catch (error) {
        console.error('Erro ao adicionar XP:', error);
    }
}; 