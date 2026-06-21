import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    const apiKey = env.REST_COUNTRIES_API_KEY;

    if (!apiKey) {
        throw new Error("REST_COUNTRIES_API_KEY is missing from .env.local");
    }

    return {
        plugins: [react()],

        server: {
            proxy: {
                "/api/restcountries": {
                    target: "https://api.restcountries.com",
                    changeOrigin: true,
                    secure: true,

                    rewrite: (path) => path.replace(/^\/api\/restcountries/, "/countries/v5"),

                    configure: (proxy) => {
                        proxy.on("proxyReq", (proxyRequest) => {
                            proxyRequest.setHeader("Authorization", `Bearer ${apiKey}`);

                            proxyRequest.removeHeader("origin");
                        });
                    },
                },
            },
        },
    };
});
