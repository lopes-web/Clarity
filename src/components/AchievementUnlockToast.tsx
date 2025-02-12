import { Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Achievement } from "@/lib/achievements";

interface AchievementUnlockToastProps {
    achievement: Achievement;
    onClose: () => void;
}

export function AchievementUnlockToast({ achievement, onClose }: AchievementUnlockToastProps) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg"
                onClick={onClose}
            >
                <div className="flex-shrink-0 p-2 bg-white/10 rounded-full">
                    <Trophy className="w-6 h-6" />
                </div>

                <div className="flex flex-col">
                    <h4 className="font-semibold text-sm">Nova Conquista Desbloqueada!</h4>
                    <p className="text-sm opacity-90">{achievement.title}</p>
                    <p className="text-xs opacity-75">+{achievement.xpReward} XP</p>
                </div>

                <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5 }}
                    onAnimationComplete={onClose}
                />
            </motion.div>
        </AnimatePresence>
    );
} 