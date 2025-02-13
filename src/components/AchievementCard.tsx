import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/achievements";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AchievementCardProps {
    achievement: Achievement;
    className?: string;
}

const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
        case 'COMMON':
            return 'bg-gray-100 text-gray-600';
        case 'RARE':
            return 'bg-blue-100 text-blue-600';
        case 'EPIC':
            return 'bg-purple-100 text-purple-600';
        case 'LEGENDARY':
            return 'bg-amber-100 text-amber-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
};

const getRarityText = (rarity: Achievement['rarity']) => {
    switch (rarity) {
        case 'COMMON':
            return 'Comum';
        case 'RARE':
            return 'Raro';
        case 'EPIC':
            return 'Épico';
        case 'LEGENDARY':
            return 'Lendário';
        default:
            return 'Comum';
    }
};

export function AchievementCard({ achievement, className }: AchievementCardProps) {
    const isUnlocked = !!achievement.unlockedAt;
    const rarityColor = getRarityColor(achievement.rarity);
    const rarityText = getRarityText(achievement.rarity);

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-lg border transition-all duration-300",
                isUnlocked
                    ? "bg-white hover:shadow-md hover:-translate-y-0.5"
                    : "bg-gray-50 opacity-75",
                className
            )}
        >
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform duration-200",
                            isUnlocked ? "hover:scale-110" : "grayscale"
                        )}>
                            {achievement.icon}
                        </div>
                        <div>
                            <h3 className={cn(
                                "font-semibold transition-colors duration-200",
                                isUnlocked ? "text-gray-900" : "text-gray-500"
                            )}>
                                {achievement.title}
                            </h3>
                            <p className={cn(
                                "text-sm mt-0.5 transition-colors duration-200",
                                isUnlocked ? "text-gray-600" : "text-gray-400"
                            )}>
                                {achievement.description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            rarityColor
                        )}>
                            {rarityText}
                        </span>
                        <span className="text-sm text-gray-500">
                            +{achievement.xpReward} XP
                        </span>
                    </div>
                    {isUnlocked && (
                        <span className="text-xs text-gray-500">
                            Desbloqueado em {format(new Date(achievement.unlockedAt!), "dd 'de' MMMM", { locale: ptBR })}
                        </span>
                    )}
                </div>
            </div>

            {!isUnlocked && (
                <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-[1px]" />
            )}
        </div>
    );
} 