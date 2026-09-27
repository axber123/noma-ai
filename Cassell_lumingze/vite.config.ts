import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    proxy: {
      // 开发模式：/api 请求转发到诺玛后端（npm run server）
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
