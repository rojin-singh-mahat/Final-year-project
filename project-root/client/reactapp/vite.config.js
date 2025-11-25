import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // allow access from other devices on the same network (college wifi)
    host: true,
    port: 5173,
  },
})
