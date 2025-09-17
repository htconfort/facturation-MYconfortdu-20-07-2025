import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    legacy({
      targets: ['defaults', 'Safari >= 12', 'iOS >= 12'],
      modernPolyfills: true,
      renderLegacyChunks: true,
      externalSystemJS: false,
    }),
  ],
  server: { host: true, port: 5173, strictPort: true },
  optimizeDeps: {
    // évite le pré-bundle très gourmand de ces libs PDF
    exclude: ['jspdf', 'html2canvas', 'html2pdf.js'],
  },
  build: {
    target: ['es2019', 'safari13'],
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
