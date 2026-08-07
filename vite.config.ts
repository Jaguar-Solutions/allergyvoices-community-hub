import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Offline support, primarily so the restaurant survey can be filled in
    // on an iPad with no signal. Also makes the rest of the site readable
    // offline as a side effect.
    VitePWA({
      registerType: "autoUpdate",
      // Off in dev. A service worker in `npm run dev` serves stale bundles
      // after every edit, which looks exactly like "my change didn't apply".
      // Test offline behaviour with `npm run build && npm run preview`, which
      // is the bundle that actually ships.
      devOptions: { enabled: false },
      includeAssets: ["favicon-32.png", "favicon-16.png", "apple-touch-icon.png"],
      manifest: {
        name: "Allergy Voices",
        short_name: "AllergyVoices",
        description:
          "Food allergy resources, recalls, and the restaurant transparency program.",
        theme_color: "#2b7fe0",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/favicon-64.png", sizes: "64x64", type: "image/png" },
          { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
          {
            src: "/allergy-voices-logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
        shortcuts: [
          { name: "New restaurant survey", url: "/restaurants/participate" },
          { name: "Saved surveys", url: "/restaurants/field" },
        ],
      },
      workbox: {
        // Deep links must resolve offline too — without this, opening the
        // installed app on /restaurants/participate with no signal 404s.
        navigateFallback: "/index.html",
        // Paths the React app must NOT answer for.
        //   /admin  — no reason to serve it offline.
        //   /menus  — allergen menus we build for restaurants are static pages
        //             served from the same domain, outside this SPA. Without
        //             this, the service worker answers those navigations with
        //             index.html and every menu link 404s inside the app.
        navigateFallbackDenylist: [/^\/admin/, /^\/menus\//],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            // Fonts come from Google's CDN; without caching, an offline iPad
            // falls back to system fonts and the form looks broken.
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Directory reads: fresh when possible, last-known when not.
            // Never cache writes — submissions go through the offline queue.
            urlPattern: /\/rest\/v1\/restaurants.*$/,
            handler: "NetworkFirst",
            method: "GET",
            options: {
              cacheName: "directory-data",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
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
