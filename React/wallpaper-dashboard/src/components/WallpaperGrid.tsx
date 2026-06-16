import type { WallpaperWithDetails } from "../types/wallpaper";
import WallpaperCard from "./WallpaperCard";

type WallpaperGridProps = {
    wallpapers: WallpaperWithDetails[];
};

function WallpaperGrid({ wallpapers }: WallpaperGridProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wallpapers.map((wallpaper) => (
                <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} />
            ))}
        </div>
    );
}

export default WallpaperGrid;
