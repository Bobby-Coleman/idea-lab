import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Relative base + hash routing so the app works at any path (e.g. /idea-lab/apps/pocket-pet/).
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist', assetsInlineLimit: 100000000 },
});
