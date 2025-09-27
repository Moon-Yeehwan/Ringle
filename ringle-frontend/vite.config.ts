// ringle-frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,          // 이미 5175로 자동 변경돼도 상관없음
    strictPort: false,   // 사용 중이면 다른 포트로 자동 변경
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
});
