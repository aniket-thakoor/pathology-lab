import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  base: '/pathology-lab/',
  plugins: [
    react(),
    mkcert(), // generates & trusts certs automatically
    VitePWA({
      registerType: 'autoUpdate',
      manifest: true,
      includeAssets: ['favicon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
      }
    })
  ],
  server: {
    https: false,     // enable SSL
    host: true       // allow LAN access for device testing
  },
  preview: {
    https: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
