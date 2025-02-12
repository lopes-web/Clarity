import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Definindo as cores do tema
export const themeColors = {
  primary: "#9b87f8",
  primaryHover: "#8a73f7",
  secondary: "#f3f4f6",
  secondaryHover: "#e5e7eb",
}
