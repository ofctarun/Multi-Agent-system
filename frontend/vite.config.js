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
      // 2. Agent Subdomain Proxy (injects Host header from originalUrl)
      '/agent-proxy': {
        target: 'http://127.0.0.1:80',
        changeOrigin: false,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const rawUrl = req.originalUrl || req.url || '';
            const parts = rawUrl.split('?')[0].split('/').filter(Boolean);
            // rawUrl is e.g. /agent-proxy/01a022ba-efbc-7398-ae7c-12afd4d29674/list-files
            const sandboxId = parts[1];
            if (sandboxId) {
              const hostHeader = `${sandboxId}.agent.localhost`;
              proxyReq.setHeader('Host', hostHeader);
            }
          });
        },
        rewrite: (path) => path.replace(/^\/agent-proxy\/[^/]+/, ''),
      },
      // 3. Preview Subdomain Proxy (injects Host header from originalUrl)
      '/preview-proxy': {
        target: 'http://127.0.0.1:80',
        changeOrigin: false,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const rawUrl = req.originalUrl || req.url || '';
            const parts = rawUrl.split('?')[0].split('/').filter(Boolean);
            const sandboxId = parts[1];
            if (sandboxId) {
              const hostHeader = `${sandboxId}.preview.localhost`;
              proxyReq.setHeader('Host', hostHeader);
            }
          });
        },
        rewrite: (path) => path.replace(/^\/preview-proxy\/[^/]+/, ''),
      },
    },
  },
})
