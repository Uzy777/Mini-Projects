import type { Wallpaper, WallpaperWithDetails } from "../types/wallpaper";

function isCloseToRatio(ratio: number, target: number, tolerance: number) {
    return Math.abs(ratio - target) < tolerance;
}

export function getAspectRatioLabel(width: number, height: number) {
    const ratio = width / height;

    if (isCloseToRatio(ratio, 16 / 9, 0.05)) {
        return "16:9";
    }

    if (isCloseToRatio(ratio, 21 / 9, 0.15)) {
        return "21:9";
    }

    if (isCloseToRatio(ratio, 32 / 9, 0.15)) {
        return "32:9";
    }

    if (isCloseToRatio(ratio, 3 / 2, 0.05)) {
        return "3:2";
    }

    if (isCloseToRatio(ratio, 4 / 3, 0.05)) {
        return "4:3";
    }

    if (isCloseToRatio(ratio, 1, 0.05)) {
        return "1:1";
    }
    
    if (height > width) {
        return "Portrait";
    }

    return "Other";
}

export function loadWallpaperDetails(wallpaper: Wallpaper): Promise<WallpaperWithDetails> {
    return new Promise((resolve) => {
        const image = new Image();

        image.onload = () => {
            const width = image.naturalWidth;
            const height = image.naturalHeight;

            resolve({
                ...wallpaper,
                width,
                height,
                aspectRatio: getAspectRatioLabel(width, height),
            });
        };

        image.onerror = () => {
            resolve({
                ...wallpaper,
                width: 0,
                height: 0,
                aspectRatio: "Other",
            });
        };

        image.src = wallpaper.imageUrl;
    });
}
