import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/talk2bill-test/',  // Change this to match your repository name
  build: {
    outDir: 'docs',
  },
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy for /api paths (handles base path automatically)
      '/talk2bill-test/api': {
        target: 'https://staging.vyaparapp.in',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/talk2bill-test/, ''),
      },
      // Also handle direct /api paths (fallback)
      '/api': {
        target: 'https://staging.vyaparapp.in',
        changeOrigin: true,
        secure: true,
      }
    }
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
