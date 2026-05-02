import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      // SVG defaults are good; we just disable removeViewBox (preserving
      // viewBox keeps SVGs scalable when consumers swap width/height).
      svg: {
        multipass: true,
        plugins: ["preset-default"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
