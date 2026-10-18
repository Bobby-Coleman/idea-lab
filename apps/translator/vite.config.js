import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the app works at any path (GitHub Pages subfolder, local file server, etc.)
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', assetsDir: 'assets' },
})
