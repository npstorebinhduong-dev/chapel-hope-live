import { defineConfig } from "vite";
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
      "/ws": { target: "ws://127.0.0.1:3001", ws: true },
    },
  },
  build: { chunkSizeWarningLimit: 1100 },
});
