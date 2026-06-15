import type { Wallpaper } from "../types/wallpaper";

export const wallpapers: Wallpaper[] = [
    {
        id: "1",
        title: "Dark Mountain",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600",
        resolution: "3840x2160",
        category: "Nature",
        tags: ["dark", "mountain", "landscape"],
    },
    {
        id: "2",
        title: "Neon City",
        imageUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455",
        thumbnailUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600",
        resolution: "2560x1440",
        category: "City",
        tags: ["neon", "city", "night"],
    },
    {
        id: "3",
        title: "Calm Forest",
        imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b",
        thumbnailUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600",
        resolution: "1920x1080",
        category: "Nature",
        tags: ["forest", "green", "calm"],
    },
];
