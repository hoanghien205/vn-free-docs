import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  // Nếu deploy lên GitHub Pages dạng https://<user>.github.io/<repo>/,
  // hãy đổi base thành '/<repo>/'.
  base: '/',
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
    // Gọi API qua cùng origin (giống khi deploy trên Vercel).
    // Chạy backend ở terminal khác: npm run api  (hoặc npm run api:memory)
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
})
