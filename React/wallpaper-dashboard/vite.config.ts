import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            "/api/wallhaven": {
                target: "https://wallhaven.cc",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/wallhaven/, "/api/v1/search"),
            },
        },
    },
});
