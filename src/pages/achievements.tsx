import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Achievement, getUserAchievements } from '@/lib/achievements';
import { Trophy } from 'lucide-react';

export default function Achievements() {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAchievements() {
            if (!user) return;
            const userAchievements = await getUserAchievements(user.id);
            setAchievements(userAchievements);
            setLoading(false);
        }

        loadAchievements();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <Trophy className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold">Minhas Conquistas</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border ${achievement.unlockedAt
                            ? 'bg-primary/10 border-primary'
                            : 'bg-muted/50 border-muted opacity-50'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{achievement.icon}</span>
                                <h3 className="font-semibold">{achievement.title}</h3>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${achievement.rarity === 'LEGENDARY' ? 'bg-yellow-500/20 text-yellow-500' :
                                achievement.rarity === 'EPIC' ? 'bg-purple-500/20 text-purple-500' :
                                    achievement.rarity === 'RARE' ? 'bg-blue-500/20 text-blue-500' :
                                        'bg-green-500/20 text-green-500'
                                }`}>
                                {achievement.rarity}
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                            {achievement.description}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-primary">+{achievement.xpReward} XP</span>
                            {achievement.unlockedAt && (
                                <span className="text-muted-foreground">
                                    Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 