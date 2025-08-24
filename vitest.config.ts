/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    exclude: [
      'node_modules',
      'dist',
      'tests/e2e/**',      // ⛔ exclure les specs Playwright
      '**/e2e/**'
    ],
  }
});
