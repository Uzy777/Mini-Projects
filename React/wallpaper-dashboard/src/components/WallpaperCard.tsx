import { useState } from "react";
import type { Wallpaper } from "../types/wallpaper";

type WallpaperCardProps = {
    wallpaper: Wallpaper;
};

type ImageSize = {
    width: number;
    height: number;
};

function WallpaperCard({ wallpaper }: WallpaperCardProps) {
    const [ImageSize, setImageSize] = useState<ImageSize | null>(null);

    return (
        <a href={wallpaper.imageUrl} download={wallpaper.filename} className="group relative block overflow-hidden rounded-2xl bg-neutral-900">
            <img
                src={wallpaper.imageUrl}
                alt=""
                className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105 group-hover:opacity-80"
                onLoad={(event) => {
                    setImageSize({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                    });
                }}
            />

            {ImageSize && (
                <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {ImageSize.width} x {ImageSize.height}
                </div>
            )}

            <div className="pointer-events-none absolute inset-0 hidden" />
        </a>
    );
}

export default WallpaperCard;
