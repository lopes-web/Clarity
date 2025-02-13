import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Achievement, getUserAchievements } from '@/lib/achievements';
import { Trophy } from 'lucide-react';
import { AchievementCard } from '@/components/AchievementCard';
import Sidebar from '@/components/Sidebar';

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

    const unlockedCount = achievements.filter(a => a.unlockedAt).length;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-primary" />
                                <div>
                                    <h1 className="text-2xl font-bold">Minhas Conquistas</h1>
                                    <p className="text-sm text-muted-foreground">
                                        {unlockedCount} de {achievements.length} conquistas desbloqueadas
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {achievements.map((achievement) => (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 