import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      strictPort: false
    },
    define: {
      // Expose .env as process.env instead of import.meta.env
      'process.env': env
    },
    envPrefix: 'VITE_'
  }
})
