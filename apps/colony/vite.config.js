import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

// Writes sw.js with a precache list of every built file, so the app works
// offline from the very first launch off the home screen.
function serviceWorker() {
  return {
    name: 'colony-service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const pub = fs.readdirSync(path.resolve('public'))
      const files = ['./', ...Object.keys(bundle), ...pub].filter((f) => !f.endsWith('.map'))
      const version = crypto.createHash('sha1').update(files.join('|')).digest('hex').slice(0, 10)
      const src = fs
        .readFileSync(path.resolve('src/sw-template.js'), 'utf8')
        .replace('__VERSION__', version)
        .replace('__PRECACHE__', JSON.stringify(files))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: src })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), serviceWorker()],
  build: { assetsInlineLimit: 0 },
})
