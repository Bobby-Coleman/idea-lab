import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

const single = process.env.SINGLE === '1'

export default defineConfig({
  base: './',
  build: single ? { outDir: 'dist-single', assetsInlineLimit: 100000000 } : {},
  plugins: [
    react(),
    single
      ? viteSingleFile()
      : VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'inline',
          includeAssets: ['icon-180.png', 'icon.svg'],
          manifest: {
            name: 'Two of Us',
            short_name: 'Two of Us',
            description: 'A Wrapped-style story about you and your person.',
            start_url: './',
            scope: './',
            display: 'standalone',
            orientation: 'portrait',
            background_color: '#0E0C14',
            theme_color: '#0E0C14',
            icons: [
              { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
              { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
            navigateFallback: null,
          },
        }),
  ],
})
