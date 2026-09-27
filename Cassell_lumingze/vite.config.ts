import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 开发模式：/api 请求转发到诺玛后端（npm run server）
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
})
