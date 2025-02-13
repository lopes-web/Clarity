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
    // Conquistas de Notas
    {
        id: 'first_grade',
        title: 'Primeira Nota',
        description: 'Registrou sua primeira nota em uma disciplina',
        icon: '📝',
        rarity: 'COMMON',
        xpReward: 25,
        type: 'GRADE',
        condition: {
            type: 'GRADE',
            value: 1,
            comparison: 'EQUALS'
        }
    },
    {
        id: 'first_perfect_grade',
        title: 'Primeira Nota 10!',
        description: 'Tirou sua primeira nota 10 em uma atividade',
        icon: '🌟',
        rarity: 'COMMON',
        xpReward: 50,
        type: 'GRADE',
        condition: {
            type: 'GRADE',
            value: 10,
            comparison: 'EQUALS'
        }
    },
    {
        id: 'good_start',
        title: 'Bom Começo',
        description: 'Tirou nota acima de 7 em sua primeira atividade',
        icon: '🎯',
        rarity: 'COMMON',
        xpReward: 30,
        type: 'GRADE',
        condition: {
            type: 'GRADE',
            value: 7,
            comparison: 'GREATER_THAN'
        }
    },

    // Conquistas de Presença
    {
        id: 'first_class',
        title: 'Primeiro Dia',
        description: 'Compareceu à sua primeira aula',
        icon: '📚',
        rarity: 'COMMON',
        xpReward: 20,
        type: 'ATTENDANCE',
        condition: {
            type: 'ATTENDANCE',
            value: 1,
            comparison: 'EQUALS'
        }
    },
    {
        id: 'perfect_week',
        title: 'Semana Perfeita',
        description: 'Não teve faltas por uma semana inteira',
        icon: '✨',
        rarity: 'COMMON',
        xpReward: 40,
        type: 'ATTENDANCE',
        condition: {
            type: 'ATTENDANCE',
            value: 7,
            comparison: 'EQUALS'
        }
    },

    // Conquistas de Tarefas
    {
        id: 'task_starter',
        title: 'Começando as Tarefas',
        description: 'Completou sua primeira tarefa',
        icon: '✅',
        rarity: 'COMMON',
        xpReward: 20,
        type: 'TASK',
        condition: {
            type: 'TASK',
            value: 1,
            comparison: 'EQUALS'
        }
    },
    {
        id: 'early_bird',
        title: 'Passarinho Madrugador',
        description: 'Completou uma tarefa com mais de 3 dias de antecedência',
        icon: '🌅',
        rarity: 'RARE',
        xpReward: 75,
        type: 'TASK',
        condition: {
            type: 'TASK',
            value: 3,
            comparison: 'GREATER_THAN'
        }
    },

    // Conquistas de Sequência
    {
        id: 'first_streak',
        title: 'Primeira Sequência',
        description: 'Manteve uma sequência de 3 dias completando tarefas',
        icon: '🔥',
        rarity: 'COMMON',
        xpReward: 35,
        type: 'STREAK',
        condition: {
            type: 'STREAK',
            value: 3,
            comparison: 'EQUALS'
        }
    },
    {
        id: 'weekly_warrior',
        title: 'Guerreiro Semanal',
        description: 'Completou pelo menos uma tarefa por 7 dias seguidos',
        icon: '⚔️',
        rarity: 'RARE',
        xpReward: 100,
        type: 'STREAK',
        condition: {
            type: 'STREAK',
            value: 7,
            comparison: 'EQUALS'
        }
    },

    // Conquistas Especiais
    {
        id: 'first_discipline',
        title: 'Nova Jornada',
        description: 'Adicionou sua primeira disciplina',
        icon: '📖',
        rarity: 'COMMON',
        xpReward: 30,
        type: 'SPECIAL',
        condition: {
            type: 'TASK',
            value: 1,
            comparison: 'EQUALS'
        }
    },
    {
        id: 'calendar_sync',
        title: 'Tudo Sincronizado',
        description: 'Conectou sua conta ao Google Calendar',
        icon: '🔄',
        rarity: 'RARE',
        xpReward: 50,
        type: 'SPECIAL',
        condition: {
            type: 'TASK',
            value: 1,
            comparison: 'EQUALS'
        }
    },

    // Conquistas Avançadas
    {
        id: 'perfect_attendance',
        title: 'Assiduidade Perfeita',
        description: 'Manteve 100% de presença em uma disciplina',
        icon: '👑',
        rarity: 'EPIC',
        xpReward: 150,
        type: 'ATTENDANCE',
        condition: {
            type: 'ATTENDANCE',
            value: 100,
            comparison: 'EQUALS'
        }
    },
    {
        id: 'semester_champion',
        title: 'Campeão do Semestre',
        description: 'Completou 5 atividades com nota acima de 8',
        icon: '🏆',
        rarity: 'LEGENDARY',
        xpReward: 500,
        type: 'GRADE',
        condition: {
            type: 'GRADE',
            value: 5,
            comparison: 'EQUALS'
        }
    }
];

// Função para verificar se um achievement foi desbloqueado
export const checkAchievement = async (userId: string, type: AchievementType, value: number): Promise<void> => {
    try {
        // Buscar conquistas já desbloqueadas
        const { data: unlockedAchievements } = await supabase
            .from('user_achievements')
            .select('achievement_id')
            .eq('user_id', userId);

        const unlockedIds = unlockedAchievements?.map(a => a.achievement_id) || [];

        // Filtrar conquistas do tipo específico que ainda não foram desbloqueadas
        const eligibleAchievements = ACHIEVEMENTS.filter(achievement =>
            achievement.type === type &&
            !unlockedIds.includes(achievement.id)
        );

        // Verificar cada conquista elegível
        for (const achievement of eligibleAchievements) {
            let shouldUnlock = false;

            // Verificação especial para a primeira nota
            if (achievement.id === 'first_grade') {
                const { count } = await supabase
                    .from('grades')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId);

                shouldUnlock = count === 1;
            } else {
                shouldUnlock = checkCondition(achievement.condition, value);
            }

            if (shouldUnlock) {
                await unlockAchievement(userId, achievement.id);
            }
        }
    } catch (error) {
        console.error('Erro ao verificar conquistas:', error);
    }
};

// Função auxiliar para verificar condição
const checkCondition = (condition: AchievementCondition, value: number): boolean => {
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