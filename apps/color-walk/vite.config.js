import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'

// Writes sw.js with the exact list of built files so the app works offline
// from the very first visit.
function serviceWorker() {
  return {
    name: 'color-walk-sw',
    apply: 'build',
    generateBundle(_, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map'))
      const statics = ['./', 'index.html', 'manifest.webmanifest',
        'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png']
      const version = Date.now().toString(36)
      const src = fs.readFileSync('src/sw-template.js', 'utf8')
        .replace('__VERSION__', version)
        .replace('__FILES__', JSON.stringify([...statics, ...files]))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: src })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), serviceWorker()],
  build: { assetsInlineLimit: 0 },
})
