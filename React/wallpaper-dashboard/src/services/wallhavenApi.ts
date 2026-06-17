import type { WallhavenWallpaper } from "../types/wallhaven";

type WallhavenSearchResponse = {
    data: WallhavenWallpaper[];
};

export async function searchWallhavenWallpapers(query: string) {
    const params = new URLSearchParams({
        q: query,
        purity: "100",
        sorting: "relevance",
    });

    const response = await fetch(`/wallhaven-api/search?${params.toString()}`);

    if (!response.ok) {
        throw new Error("Failed to fetch wallpapers form Wallhaven");
    }

    const result: WallhavenSearchResponse = await response.json();

    return result.data;
}
