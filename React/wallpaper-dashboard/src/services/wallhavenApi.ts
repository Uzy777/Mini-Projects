import type { WallhavenWallpaper } from "../types/wallhaven";

type WallhavenSearchResponse = {
    data: WallhavenWallpaper[];
};

export async function searchWallhavenWallpapers(query: string, categories: string) {
    const params = new URLSearchParams({
        q: query,
        categories,
        purity: "100",
        sorting: "relevance",
    });

    const response = await fetch(`/api/wallhaven?${params.toString()}`);

    if (!response.ok) {
        throw new Error("Failed to fetch wallpapers from Wallhaven");
    }

    const result: WallhavenSearchResponse = await response.json();

    return result.data;
}
