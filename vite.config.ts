import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStartVite } from '@tanstack/start-vite-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tanstackStartVite(),
    react(),
    tsconfigPaths(),
  ],
})rm