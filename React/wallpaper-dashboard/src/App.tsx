import WallpaperCard from "./components/WallpaperCard";
import { wallpapers } from "./data/wallpapers";

function App() {
    return (
        <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
            <section className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold">Wallpaper Dashboard</h1>
                    <p className="mt-3 text-neutral-400">A collection of wallpapers ready to download.</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {wallpapers.map((wallpaper) => (
                        <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} />
                    ))}
                </div>
            </section>
        </main>
    );
}

export default App;
