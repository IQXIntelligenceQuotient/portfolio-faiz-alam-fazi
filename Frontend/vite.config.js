import { siteUrl, siteBase } from './scripts/deployment-config.mjs';
import { deploymentUrls } from './scripts/deployment-babel.mjs';
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    base: siteBase,
  define: { "import.meta.env.VITE_PUBLIC_SITE_URL": JSON.stringify(siteUrl) },
  plugins: [react({ babel: { plugins: [[deploymentUrls, { siteUrl }]] } }), tailwindcss()],
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    minify: "esbuild",
    target: "es2020",
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React — smallest possible initial bundle
          if (id.includes("node_modules/react-dom")) return "react_dom";
          if (id.includes("node_modules/react/")) return "react_vendor";
          // framer-motion — split animation core from gestures to reduce initial parse
          if (id.includes("node_modules/framer-motion/dist/es/animation")) return "motion_animation";
          if (id.includes("node_modules/framer-motion") || id.includes("node_modules/motion")) {
            return "motion_vendor";
          }
          // Router
          if (id.includes("node_modules/react-router") || id.includes("node_modules/react-router-dom")) {
            return "router_vendor";
          }
          // Icons — tree-shaken but still worth isolating
          if (id.includes("node_modules/lucide-react")) return "icons_vendor";
          // Swiper only used on service pages
          if (id.includes("node_modules/swiper")) return "swiper_vendor";
          // Helmet
          if (id.includes("node_modules/react-helmet-async")) return "helmet_vendor";
          // FAQ data + layout together
          if (id.includes("FAQ_servises") || id.includes("FAQLayout")) return "faq_chunk";
          // Shared service data
          if (id.includes("servicesData") || id.includes("schemaBuilder") || id.includes("siteMeta")) {
            return "services_data";
          }
          // Blog — lazy loaded, keep separate
          if (id.includes("blogData") || id.includes("pages/Blog")) return "blog_chunk";
          // Service pages — all in one deferred chunk
          if (id.includes("pages/Service")) return "service_pages";
        },
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
