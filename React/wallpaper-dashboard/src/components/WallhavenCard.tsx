import type { WallhavenWallpaper } from "../types/wallhaven";

type WallhavenCardProps = {
    wallpaper: WallhavenWallpaper;
};

function WallhavenCard({ wallpaper }: WallhavenCardProps) {
    return (
        <a href={wallpaper.path} download target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-2xl bg-neutral-900">
            
            <img
                src={wallpaper.thumbs.large}
                alt=""
                loading="lazy"
                className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105 group-hover:opacity-80"
            />

            <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">{wallpaper.resolution}</div>
            {/* <span className="ml-2 text-neutral-300">{wallpaper.ratio}</span> */}
        </a>
    );
}

export default WallhavenCard;
