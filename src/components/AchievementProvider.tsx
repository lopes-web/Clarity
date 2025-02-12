import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Achievement } from "@/lib/achievements";
import { AchievementUnlockToast } from "./AchievementUnlockToast";

interface AchievementContextType {
    showUnlockNotification: (achievement: Achievement) => void;
}

const AchievementContext = createContext<AchievementContextType | null>(null);

export function useAchievements() {
    const context = useContext(AchievementContext);
    if (!context) {
        throw new Error("useAchievements deve ser usado dentro de um AchievementProvider");
    }
    return context;
}

interface AchievementProviderProps {
    children: ReactNode;
}

export function AchievementProvider({ children }: AchievementProviderProps) {
    const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

    const showUnlockNotification = useCallback((achievement: Achievement) => {
        setCurrentAchievement(achievement);
    }, []);

    const handleClose = useCallback(() => {
        setCurrentAchievement(null);
    }, []);

    return (
        <AchievementContext.Provider value={{ showUnlockNotification }}>
            {children}
            {currentAchievement && (
                <AchievementUnlockToast
                    achievement={currentAchievement}
                    onClose={handleClose}
                />
            )}
        </AchievementContext.Provider>
    );
} 