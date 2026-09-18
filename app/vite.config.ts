import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const enablePwa = process.env.DISABLE_PWA !== 'true'

export default defineConfig({
  resolve: {
    alias: enablePwa
      ? {}
      : {
          'virtual:pwa-register': path.resolve(__dirname, 'src/stubs/pwa-register.ts'),
        },
  },
  plugins: [
    react(),
    tailwindcss(),
    ...(enablePwa
      ? [VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'logo.svg', 'logo-icon.svg', 'logo-dark.svg'],
      manifest: {
        name: 'SimulaOrdem',
        short_name: 'SimulaOrdem',
        description: 'Preparação completa para a OAB — 1ª e 2ª fase',
        theme_color: '#1C3F3A',
        background_color: '#F8FAFB',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/logo-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/logo-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/banco_oab.json', '**/pecas_oab.json'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    })]
      : []),
  ],
  server: {
    host: true,
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') } },
  },
  preview: { host: true, port: 4173 },
})
