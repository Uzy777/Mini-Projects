import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            "/wallhaven-api": {
                target: "https://wallhaven.cc",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/wallhaven-api/, "/api/v1"),
            },
        },
    },
});
