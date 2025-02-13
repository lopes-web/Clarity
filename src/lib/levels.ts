export interface Level {
    level: number;
    minXP: number;
    maxXP: number;
    title: string;
}

export const LEVELS: Level[] = [
    { level: 1, minXP: 0, maxXP: 100, title: "Calouro" },
    { level: 2, minXP: 100, maxXP: 250, title: "Iniciante" },
    { level: 3, minXP: 250, maxXP: 500, title: "Estudante" },
    { level: 4, minXP: 500, maxXP: 1000, title: "Dedicado" },
    { level: 5, minXP: 1000, maxXP: 2000, title: "Aplicado" },
    { level: 6, minXP: 2000, maxXP: 3500, title: "Exemplar" },
    { level: 7, minXP: 3500, maxXP: 5500, title: "Notável" },
    { level: 8, minXP: 5500, maxXP: 8000, title: "Brilhante" },
    { level: 9, minXP: 8000, maxXP: 11000, title: "Mestre" },
    { level: 10, minXP: 11000, maxXP: Infinity, title: "Lendário" }
];

export function calculateLevel(xp: number): Level {
    return LEVELS.find(level => xp >= level.minXP && xp < level.maxXP) || LEVELS[0];
}

export function calculateProgress(xp: number, level: Level): number {
    if (level.maxXP === Infinity) return 100;
    const currentLevelXP = xp - level.minXP;
    const levelRange = level.maxXP - level.minXP;
    return Math.min(Math.floor((currentLevelXP / levelRange) * 100), 100);
}

export function calculateXPToNextLevel(xp: number, level: Level): number {
    if (level.maxXP === Infinity) return 0;
    return level.maxXP - xp;
} 