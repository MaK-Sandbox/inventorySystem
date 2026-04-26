import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: false },
      '/search': { target: 'http://localhost:3000', changeOrigin: false },
    },
  },
  build: {
    // Builds straight into the folder Express already serves statically
    outDir: '../public',
    emptyOutDir: true,
  },
});
