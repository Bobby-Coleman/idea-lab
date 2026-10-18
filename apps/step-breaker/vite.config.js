import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the app works at any path (GitHub Pages subfolder, preview hosts).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { assetsInlineLimit: 0 },
})
