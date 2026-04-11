import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/',

  plugins: [
    react(),
    VitePWA({
      // autoUpdate: o SW regista-se e actualiza-se silenciosamente — comportamento PWA standard
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      includeAssets: [
        'logo.png', 'logo.webp',
        'icons/favicon.svg',
        'icons/logo-192.png', 'icons/logo-512.png',
        'icons/logo-192.webp', 'icons/logo-512.webp',
        'icons/logo-maskable.png', 'icons/logo-maskable.webp',
        'offline.html',
      ],

      manifest: {
        name: 'Moniv - Finanças Pessoais',
        short_name: 'Moniv',
        description: 'Seu assistente financeiro pessoal inteligente. Controle receitas, despesas e metas num único lugar.',
        theme_color: '#6366f1',
        background_color: '#0a0a0f',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/?source=pwa',
        lang: 'pt-BR',
        dir: 'ltr',
        categories: ['finance', 'productivity', 'utilities'],
        prefer_related_applications: false,

        icons: [
          // PNG fallbacks (required — Chrome uses these for install)
          {
            src: '/icons/logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          // Maskable (safe-zone padding for Android adaptive icons)
          {
            src: '/icons/logo-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          // WebP variants (modern browsers prefer these — smaller, sharper)
          {
            src: '/icons/logo-192.webp',
            sizes: '192x192',
            type: 'image/webp',
            purpose: 'any',
          },
          {
            src: '/icons/logo-512.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any',
          },
          {
            src: '/icons/logo-maskable.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'maskable',
          },
        ],

        shortcuts: [
          {
            name: 'Nova Transação',
            short_name: 'Transação',
            description: 'Adicionar uma nova transação',
            url: '/transactions?action=add',
            icons: [{ src: '/icons/logo-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Ver resumo financeiro',
            url: '/dashboard',
            icons: [{ src: '/icons/logo-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp,json}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\//, /\.[^/?]+$/],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        runtimeCaching: [
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Supabase API — NetworkFirst
          {
            urlPattern: ({ url }) => url.hostname.includes('supabase.co'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Imagens
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // JS/CSS
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },

      devOptions: {
        enabled: false,
        type: 'module',
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts':  ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-pdf':     ['jspdf', 'jspdf-autotable'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
