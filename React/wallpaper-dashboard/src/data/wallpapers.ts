import type { Wallpaper } from "../types/wallpaper";

const images = import.meta.glob("../assets/wallpapers/**/*.{jpg,jpeg,png,webp,avif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

function getFilename(path: string) {
    return path.split("/").pop() ?? "wallpaper";
}

function getCategory(path: string) {
    const parts = path.split("/");
    const wallpapersIndex = parts.indexOf("wallpapers");
    const Category = parts[wallpapersIndex + 1];

    if (!Category || Category.includes(".")) {
        return "uncategorised";
    }

    return Category;
}

export const wallpapers: Wallpaper[] = Object.entries(images).map(([path, imageUrl]) => ({
    id: path,
    imageUrl,
    filename: getFilename(path),
    category: getCategory(path),
}));
