import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  server: { host: true, port: 5173, strictPort: true },
  optimizeDeps: {
    // évite le pré-bundle très gourmand de ces libs PDF
    exclude: ['jspdf', 'html2canvas', 'html2pdf.js'],
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
