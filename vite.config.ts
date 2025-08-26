import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  optimizeDeps: {
    exclude: ['jspdf', 'html2canvas', 'html2pdf.js'], // évite un pré-bundle très gourmand
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          pdf: ['jspdf', 'html2canvas', 'html2pdf.js'],
        },
      },
    },
  },
});
