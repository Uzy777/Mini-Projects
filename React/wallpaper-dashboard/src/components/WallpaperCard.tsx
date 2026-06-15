import type { Wallpaper } from "../types/wallpaper";

type WallpaperCardProps = {
    wallpaper: Wallpaper;
};

function WallpaperCard({ wallpaper }: WallpaperCardProps) {
    return (
        <article className="overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800">
            <img className="h-56 w-full object-cover" src={wallpaper.imageUrl} alt={wallpaper.title}></img>

            <div className="p-4">
                <h2 className="text-lg font-semibold">{wallpaper.title}</h2>

                <p className="mt-1 text-sm text-neutral-400">
                    {wallpaper.resolution} - {wallpaper.category}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                    {wallpaper.tags.map((tag) => (
                        <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-300" key={tag}>
                            {" #" + tag}
                        </span>
                    ))}
                </div>
            </div>
        </article>
    );
}

export default WallpaperCard;
