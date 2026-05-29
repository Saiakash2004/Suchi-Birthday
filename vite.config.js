import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // If deploying to https://<username>.github.io/<repo-name>/,
  // set base to '/<repo-name>/'. If deploying to a custom domain or root site, keep it as '/'
  base: '/',
})
