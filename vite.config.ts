import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/n8n': {
        target: 'https://n8n.srv765811.hstgr.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, ''),
        secure: true,
        // Préserver les headers et le body automatiquement
        xfwd: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 PROXY REQUEST:', {
              method: req.method,
              url: req.url,
              targetUrl: proxyReq.path,
              contentLength: req.headers['content-length'],
              contentType: req.headers['content-type']
            });
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 PROXY RESPONSE:', {
              status: proxyRes.statusCode,
              statusMessage: proxyRes.statusMessage,
              contentType: proxyRes.headers['content-type']
            });
          });
          
          proxy.on('error', (err, req, res) => {
            console.error('❌ PROXY ERROR:', err.message);
          });
        }
      },
    },
  },
});
