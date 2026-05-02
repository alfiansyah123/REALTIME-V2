import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { localApiProxy } from './server/api-proxy.js'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    localApiProxy(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'Realtime Conversion Dashboard',
        short_name: 'Dashboard',
        description: 'Track your conversions in real-time',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // No proxy needed — all calls go directly to Supabase
    port: 3000,
    strictPort: true,
  }
})
