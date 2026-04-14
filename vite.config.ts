import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), tailwindcss()],
  build: {
    // Raise the warning threshold — Three.js is inherently large
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — loaded first, cached aggressively
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Framer Motion is ~100 KB — separate so it can be cached independently
          'vendor-motion': ['framer-motion'],
          // Three.js ecosystem is ~500 KB — lazy-loaded with HeroCanvas
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})
