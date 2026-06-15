import type { Wallpaper } from "../types/wallpaper";

type WallpaperCardProps = {
    wallpaper: Wallpaper;
};

function WallpaperCard({ wallpaper }: WallpaperCardProps) {
    return (
        <a href={wallpaper.imageUrl} download={wallpaper.filename} className="group block overflow-hidden rounded-2xl bg-neutral-900">
            <img
                src={wallpaper.imageUrl}
                alt=""
                className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105 group-hover:opacity-80"
            />

            <div className="pointer-events-none absolute inset-0 hidden" />

            <p>{wallpaper.category}</p>
        </a>
    );
}

export default WallpaperCard;
