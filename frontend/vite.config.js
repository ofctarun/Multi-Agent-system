import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createProxyMiddleware } from 'http-proxy-middleware'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Custom plugin: handle /agent-proxy with proper Host headers
    // for both HTTP and WebSocket (terminal Socket.IO).
    // Vite's built-in proxy can't set Host headers on WebSocket upgrades.
    {
      name: 'sandbox-proxy',
      configureServer(server) {
        const agentProxies = {}

        function getAgentProxy(sandboxId) {
          if (!agentProxies[sandboxId]) {
            agentProxies[sandboxId] = createProxyMiddleware({
              target: 'http://127.0.0.1:80',
              changeOrigin: true,
              ws: true,
              headers: { Host: `${sandboxId}.agent.localhost` },
              on: {
                error: (err) => {
                  if (err.code !== 'ECONNRESET') {
                    console.error(`[agent-proxy] ${sandboxId}: ${err.message}`)
                  }
                },
              },
            })
          }
          return agentProxies[sandboxId]
        }

        // Handle /agent-proxy/<sandboxId>/... HTTP requests
        server.middlewares.use((req, res, next) => {
          const match = req.url?.match(/^\/agent-proxy\/([^/]+)(\/.*)?$/)
          if (!match) return next()

          const sandboxId = match[1]
          req.url = match[2] || '/'
          req.originalUrl = req.url

          getAgentProxy(sandboxId)(req, res, next)
        })

        // Handle WebSocket upgrades for /agent-proxy (terminal Socket.IO)
        server.httpServer?.on('upgrade', (req, socket, head) => {
          const url = req.url || ''

          const agentMatch = url.match(/^\/agent-proxy\/([^/]+)(\/.*)?$/)
          if (agentMatch) {
            const sandboxId = agentMatch[1]
            req.url = agentMatch[2] || '/'
            const proxy = getAgentProxy(sandboxId)
            proxy.upgrade(req, socket, head)
            return
          }
          // Other WebSocket upgrades (like Vite HMR) are handled by Vite itself
        })
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      // Backend REST API
      '/api': {
        target: 'http://127.0.0.1:80',
        changeOrigin: true,
        secure: false,
      },
      // NOTE: /agent-proxy is handled by the custom plugin above (not Vite proxy)
      // because Vite's built-in proxy can't set Host headers on WebSocket upgrades,
      // causing ECONNABORTED errors for the terminal's Socket.IO connection.
    },
  },
})
