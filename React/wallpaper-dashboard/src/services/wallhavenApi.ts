import type { WallhavenWallpaper } from "../types/wallhaven";

type WallhavenSearchResponse = {
    data: WallhavenWallpaper[];
};

export async function searchWallhavenWallpapers(query: string) {
    const params = new URLSearchParams({
        q: query,
    });

    const response = await fetch(`/api/wallhaven?${params.toString()}`);

    if (!response.ok) {
        throw new Error("Failed to fetch wallpapers from Wallhaven");
    }

    const result: WallhavenSearchResponse = await response.json();

    return result.data;
}
