import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 5173, 
    strictPort: true,
    host: true
  },
  preview: { 
    port: 5174, 
    strictPort: true,
    host: true
  },
  build: { 
    outDir: 'dist', 
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild'
  },
  base: '/'
});
