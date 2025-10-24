import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: mode === 'development' ? '/preview/' : '/',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    cors: true
  }
}))