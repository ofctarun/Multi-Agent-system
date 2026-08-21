import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      // 1. Backend REST API
      '/api': {
        target: 'http://127.0.0.1:80',
        changeOrigin: true,
        secure: false,
      },
      // 2. Agent Subdomain Proxy
      '/agent-proxy': {
        target: 'http://127.0.0.1:80',
        changeOrigin: false,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const rawUrl = req.originalUrl || req.url || '';
            const parts = rawUrl.split('?')[0].split('/').filter(Boolean);
            const sandboxId = parts[1];
            if (sandboxId) {
              proxyReq.setHeader('Host', `${sandboxId}.agent.localhost`);
            }
          });
        },
        rewrite: (path) => path.replace(/^\/agent-proxy\/[^/]+/, ''),
      },
      // 3. Preview Subdomain Proxy
      '/preview-proxy': {
        target: 'http://127.0.0.1:80',
        changeOrigin: false,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const rawUrl = req.originalUrl || req.url || '';
            const parts = rawUrl.split('?')[0].split('/').filter(Boolean);
            const sandboxId = parts[1];
            if (sandboxId) {
              proxyReq.setHeader('Host', `${sandboxId}.preview.localhost`);
            }
          });
        },
        rewrite: (path) => path.replace(/^\/preview-proxy\/[^/]+/, ''),
      },
    },
  },
})
