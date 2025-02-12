import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star } from "lucide-react";
import { AchievementCard } from "./AchievementCard";
import { getUserAchievements, type Achievement } from "@/lib/achievements";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

interface UserStats {
    xp: number;
    level: number;
    nextLevelXP: number;
    progress: number;
}

const calculateLevel = (xp: number): UserStats => {
    const baseXP = 100; // XP base para o primeiro nível
    const multiplier = 1.5; // Multiplicador de dificuldade

    let level = 1;
    let totalXPForNextLevel = baseXP;
    let accumulatedXP = 0;

    while (xp >= totalXPForNextLevel) {
        level++;
        accumulatedXP = totalXPForNextLevel;
        totalXPForNextLevel += Math.floor(baseXP * Math.pow(multiplier, level - 1));
    }

    const nextLevelXP = totalXPForNextLevel;
    const currentLevelXP = xp - accumulatedXP;
    const xpNeeded = nextLevelXP - accumulatedXP;
    const progress = (currentLevelXP / xpNeeded) * 100;

    return {
        xp,
        level,
        nextLevelXP,
        progress
    };
};

export function AchievementsDialog() {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [stats, setStats] = useState<UserStats>({ xp: 0, level: 1, nextLevelXP: 100, progress: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            if (!user) return;

            try {
                setIsLoading(true);

                // Carregar conquistas
                const userAchievements = await getUserAchievements(user.id);
                setAchievements(userAchievements);

                // Carregar XP
                const { data: statsData } = await supabase
                    .from('user_stats')
                    .select('xp')
                    .eq('user_id', user.id)
                    .single();

                if (statsData) {
                    setStats(calculateLevel(statsData.xp));
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [user]);

    const unlockedCount = achievements.filter(a => a.unlockedAt).length;
    const totalCount = achievements.length;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 transition-all duration-200 hover:bg-primary hover:text-white"
                >
                    <Trophy className="w-4 h-4" />
                    <span>Conquistas</span>
                    {unlockedCount > 0 && (
                        <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                            {unlockedCount}/{totalCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Suas Conquistas</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Level Info */}
                    <div className="bg-primary/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Star className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Nível {stats.level}</h3>
                                    <p className="text-sm text-gray-600">{stats.xp} XP total</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">
                                    Próximo nível em {stats.nextLevelXP - stats.xp} XP
                                </p>
                            </div>
                        </div>
                        <Progress value={stats.progress} className="h-2" />
                    </div>

                    {/* Achievements Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {achievements.map((achievement) => (
                            <AchievementCard
                                key={achievement.id}
                                achievement={achievement}
                            />
                        ))}
                    </div>

                    {isLoading && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Carregando conquistas...</p>
                        </div>
                    )}

                    {!isLoading && achievements.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Nenhuma conquista disponível.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 