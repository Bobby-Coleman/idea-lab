import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLE=1 builds one inlined HTML file for previews (no service worker).
const single = process.env.SINGLE === '1'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    single
      ? viteSingleFile()
      : VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'inline',
          includeAssets: ['apple-touch-icon.png', 'icon.svg'],
          manifest: {
            name: 'Tiny Lungs',
            short_name: 'Tiny Lungs',
            description: 'Quit vaping for someone small.',
            start_url: './',
            scope: './',
            display: 'standalone',
            orientation: 'portrait',
            background_color: '#DDF4EC',
            theme_color: '#DDF4EC',
            icons: [
              { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
              { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
          workbox: { globPatterns: ['**/*.{js,css,html,png,svg,woff2}'] },
        }),
  ],
})
