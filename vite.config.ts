import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Baustempel, damit in der App sichtbar ist, welche Version läuft.
const BUILD_ID = new Date().toISOString().slice(0, 16).replace('T', ' ')

// GitHub Pages liefert das Repo unter /Tonlerner/ aus (Repo-Name, Groß-/Kleinschreibung zählt).
export default defineConfig({
  base: '/Tonlerner/',
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Posaune (Standard) direkt mit-precachen, damit sie sofort offline klingt.
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'soundfonts/trombone.json'],
      manifest: {
        name: 'Tonlerner',
        short_name: 'Tonlerner',
        description: 'Gehörbildung für Blechbläser – Töne, Intervalle, Intonation.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/Tonlerner/',
        scope: '/Tonlerner/',
        icons: [
          { src: 'icons/icon-256.png', sizes: '256x256', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Neue Version sofort übernehmen (iOS hält den Cache sonst sehr lange).
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // index.html nie aus dem Cache ausliefern, sonst bleibt die App alt.
        navigateFallback: 'index.html',
        // Weitere Instrumente werden bei erster Nutzung heruntergeladen und
        // dann dauerhaft gecacht (danach auch offline verfügbar).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/soundfonts/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'tonlerner-soundfonts',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 120 },
            },
          },
        ],
      },
    }),
  ],
})
