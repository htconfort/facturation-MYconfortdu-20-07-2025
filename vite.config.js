import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        visualizer({
            open: true, // ouvre automatiquement le rapport après build
            filename: 'stats.html', // fichier généré à la racine
            template: 'treemap', // treemap | sunburst | network
            gzipSize: true,
            brotliSize: true,
        }),
    ],
    optimizeDeps: {
        // tu avais déjà exclu lucide-react, on conserve
        exclude: ['lucide-react'],
    },
    build: {
        sourcemap: false,
        minify: 'esbuild',
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (id.includes('node_modules')) {
                        // regroupe les utilitaires UI lourds dans un chunk dédié
                        if (id.includes('html2canvas') ||
                            id.includes('purify') || // dompurify (selon lib, parfois "purify.es")
                            id.includes('signature_pad')) {
                            return 'ui-utils';
                        }
                        // tout le reste des node_modules
                        return 'vendor';
                    }
                },
            },
        },
    },
    server: {
        proxy: {
            '/api/n8n': {
                target: 'https://n8n.srv765811.hstgr.cloud',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api\/n8n/, ''); },
                secure: true,
                xfwd: true,
                configure: function (proxy /* http-proxy */, _options) {
                    proxy.on('proxyReq', function (proxyReq, req, _res) {
                        // ⚠️ évite de logguer des payloads sensibles en prod
                        console.log('🔄 PROXY REQUEST:', {
                            method: req.method,
                            url: req.url,
                            targetUrl: proxyReq.path,
                            contentLength: req.headers['content-length'],
                            contentType: req.headers['content-type'],
                        });
                    });
                    proxy.on('proxyRes', function (proxyRes, _req, _res) {
                        console.log('📥 PROXY RESPONSE:', {
                            status: proxyRes.statusCode,
                            statusMessage: proxyRes.statusMessage,
                            contentType: proxyRes.headers['content-type'],
                        });
                    });
                    proxy.on('error', function (err) {
                        console.error('❌ PROXY ERROR:', err.message);
                    });
                },
            },
        },
    },
});
