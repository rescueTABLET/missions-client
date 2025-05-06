import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: true,
      },
      manifest: {
        id: "/",
        name: "rescueTABLET Missions Client Demo",
        short_name: "Missions Demo",
        lang: "en",
        start_url: ".",
        display: "standalone",
        display_override: ["minimal-ui"],
        theme_color: "#a22717",
        background_color: "#fafafa",
        icons: [
          {
            src: "logo.svg",
            type: "image/svg+xml",
            sizes: "512x512",
            purpose: "any",
          },
        ],
      },
    }),
  ],
});
