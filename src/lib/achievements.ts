import { supabase } from './supabase';

export type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: AchievementRarity;
    xpReward: number;
    unlockedAt?: string;
    type: AchievementType;
    condition: AchievementCondition;
}

export async function getUserAchievements(userId: string): Promise<Achievement[]> {
    // Aqui você pode implementar a lógica para buscar as conquistas do usuário
    // Por enquanto, vou retornar alguns dados de exemplo
    return [
        {
            id: '1',
            title: 'Primeiro Passo',
            description: 'Complete sua primeira atividade',
            icon: '🎯',
            rarity: 'COMMON',
            xpReward: 50,
            unlockedAt: new Date().toISOString(),
            type: 'GRADE',
            condition: {
                type: 'GRADE',
                value: 10,
                comparison: 'EQUALS'
            }
        },
        {
            id: '2',
            title: 'Estudante Dedicado',
            description: 'Complete 10 atividades em uma única disciplina',
            icon: '📚',
            rarity: 'RARE',
            xpReward: 100,
            type: 'GRADE',
            condition: {
                type: 'GRADE',
                value: 10,
                comparison: 'EQUALS'
            }
        },
        {
            id: '3',
            title: 'Mestre do Conhecimento',
            description: 'Obtenha nota máxima em todas as atividades de uma disciplina',
            icon: '🏆',
            rarity: 'EPIC',
            xpReward: 200,
            type: 'GRADE',
            condition: {
                type: 'GRADE',
                value: 10,
                comparison: 'EQUALS'
            }
        },
        {
            id: '4',
            title: 'Lendário',
            description: 'Complete todas as disciplinas com média acima de 9',
            icon: '👑',
            rarity: 'LEGENDARY',
            xpReward: 500,
            type: 'GRADE',
            condition: {
                type: 'GRADE',
                value: 9,
                comparison: 'GREATER_THAN'
            }
        },
    ];
}

export type AchievementType =
    | 'GRADE'      // Relacionado a notas
    | 'ATTENDANCE' // Relacionado a presença
    | 'TASK'       // Relacionado a tarefas
    | 'STREAK'     // Relacionado a sequências
    | 'SPECIAL';   // Conquistas especiais

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
        rarity: 'COMMON',
        xpReward: 100,
        type: 'GRADE',
        condition: {
            type: 'GRADE',
            value: 10,
            comparison: 'EQUALS'
        }
    },
    {
        id: 'perfect_attendance',
        title: 'Assiduidade Perfeita 📚',
        description: 'Manteve 100% de presença em uma disciplina.',
        icon: '✅',
        rarity: 'RARE',
        xpReward: 150,
        type: 'ATTENDANCE',
        condition: {
            type: 'ATTENDANCE',
            value: 100,
            comparison: 'EQUALS'
        }
    },
    {
        id: 'task_master',
        title: 'Mestre das Tarefas 🏆',
        description: 'Completou 10 tarefas antes do prazo.',
        icon: '⚡',
        rarity: 'RARE',
        xpReward: 200,
        type: 'TASK',
        condition: {
            type: 'TASK',
            value: 10,
            comparison: 'EQUALS'
        }
    },
    {
        id: 'study_streak',
        title: 'Dedicação Máxima 🔥',
        description: 'Manteve uma sequência de 7 dias completando tarefas.',
        icon: '🔥',
        rarity: 'EPIC',
        xpReward: 300,
        type: 'STREAK',
        condition: {
            type: 'STREAK',
            value: 7,
            comparison: 'EQUALS'
        }
    },
    {
        id: 'semester_champion',
        title: 'Campeão do Semestre 👑',
        description: 'Alcançou média geral acima de 9.',
        icon: '👑',
        rarity: 'LEGENDARY',
        xpReward: 500,
        type: 'GRADE',
        condition: {
            type: 'GRADE',
            value: 9,
            comparison: 'GREATER_THAN'
        }
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
            await addUserXP(userId, achievement.xpReward);
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