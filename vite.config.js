import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // If deploying to https://<username>.github.io/Suchi-Birthday/, set base to '/Suchi-Birthday/'
  base: '/Suchi-Birthday/',
})
