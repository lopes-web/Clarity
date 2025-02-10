import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': {
      VITE_GOOGLE_CLIENT_ID: JSON.stringify(process.env.VITE_GOOGLE_CLIENT_ID),
      VITE_GOOGLE_CLIENT_SECRET: JSON.stringify(process.env.VITE_GOOGLE_CLIENT_SECRET),
      VITE_GOOGLE_API_KEY: JSON.stringify(process.env.VITE_GOOGLE_API_KEY),
    },
  },
}));
