import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  optimizeDeps: {
    exclude: ['jspdf', 'html2canvas', 'html2pdf.js'], // évite un pré-bundle très gourmand
  },
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
  base: '/'
});
