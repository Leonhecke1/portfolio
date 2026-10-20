import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  // In dev the Express API (server/server.js) runs separately on port 3001; production serves both from Express.
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
    },
  },
})
