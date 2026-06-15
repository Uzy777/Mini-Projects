import type { Wallpaper } from "../types/wallpaper";

type WallpaperCardProps = {
    wallpaper: Wallpaper;
};

function WallpaperCard({ wallpaper }: WallpaperCardProps) {
    return (
        <article className="">
            <img className="" src={wallpaper.imageUrl} alt={wallpaper.title}></img>

            <div className="">
                <h2 className="">{wallpaper.title}</h2>

                <p className="">
                    {wallpaper.resolution} - {wallpaper.category}
                </p>

                <div className="">
                    {wallpaper.tags.map((tag) => (
                        <span className="" key={tag}>
                            {" #" + tag}
                        </span>
                    ))}
                </div>
            </div>
        </article>
    );
}

export default WallpaperCard;
