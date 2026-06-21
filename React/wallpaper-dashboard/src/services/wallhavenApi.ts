import type { WallhavenWallpaper } from "../types/wallhaven";

type WallhavenSearchResponse = {
    data: WallhavenWallpaper[];
};

export async function searchWallhavenWallpapers(query: string, categories: string, apiKey: string) {
    const params = new URLSearchParams({
        q: query,
        categories,
        purity: "100",
        sorting: "relevance",
    });

    const headers = new Headers();

    if (apiKey.trim()) {
        headers.set("X-API-Key", apiKey.trim());
    }

    const response = await fetch(`/api/wallhaven?${params.toString()}`, {
        headers,
    });
    
    if (!response.ok) {
        throw new Error("Failed to fetch wallpapers from Wallhaven");
    }

    const result: WallhavenSearchResponse = await response.json();

    return result.data;
}
