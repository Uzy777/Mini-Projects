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

                <div className="mt-5 flex gap-3">
                    <a
                        className="flex-1 rounded-xl bg-white px-4 py-2 text-center text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
                        href={wallpaper.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Preview
                    </a>

                    <a
                        className="flex-1 rounded-xl border border-neutral-700 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
                        href={wallpaper.imageUrl}
                        download
                    >
                        Download
                    </a>
                </div>
            </div>
        </article>
    );
}

export default WallpaperCard;
