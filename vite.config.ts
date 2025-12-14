import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Only proxy in development mode
    ...(mode === 'development' && {
      proxy: {
        // Proxy API requests to backend
        '/api': {
          target: 'http://localhost:8001',
          changeOrigin: true,
          secure: false,
        }
      }
    })
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
}));
