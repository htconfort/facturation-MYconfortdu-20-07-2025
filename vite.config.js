import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [
        react(),
        // Visualizer seulement en mode développement ou avec flag
        command === 'build' && process.env.ANALYZE === 'true' ? visualizer({
            open: false,
            filename: 'stats.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
        }) : null,
    ].filter(Boolean),
    optimizeDeps: {
        exclude: ['lucide-react'],
        // Pré-build des dépendances lourdes
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'zustand',
            'html2canvas',
            'jspdf',
            'signature_pad'
        ]
    },
    build: {
        sourcemap: false,
        minify: 'esbuild',
        target: 'esnext',
        chunkSizeWarningLimit: 2000,
        // Optimisations de build
        cssCodeSplit: true,
        reportCompressedSize: false,
        rollupOptions: {
            output: {
                // Optimisation des chunks
                manualChunks: (id) => {
                    // React/React-DOM core
                    if (id.includes('react') || id.includes('react-dom')) {
                        return 'react-core';
                    }
                    // Utilitaires PDF
                    if (id.includes('jspdf') || id.includes('html2canvas')) {
                        return 'pdf-utils';
                    }
                    // Utilitaires UI
                    if (id.includes('html2canvas') ||
                        id.includes('purify') ||
                        id.includes('signature_pad')) {
                        return 'ui-utils';
                    }
                    // Node modules vendor
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                    // Code source de l'app
                    if (id.includes('/src/')) {
                        return 'app';
                    }
                },
                // Nommage optimisé pour le cache
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            },
        },
        // Optimisations ESBuild
        esbuild: {
            drop: ['console', 'debugger'], // Supprime les logs en prod
            legalComments: 'none'
        }
    },
    server: {
        proxy: {
            '/api/n8n': {
                target: 'https://n8n.myconfort.fr',
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
}));
