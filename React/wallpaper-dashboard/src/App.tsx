import { useEffect, useState } from "react";
import FilterGroup from "./components/FilterGroup";
import WallpaperGrid from "./components/WallpaperGrid";
import WallhavenSearch from "./components/WallhavenSearch";
import { wallpapers } from "./data/wallpapers";
import type { WallpaperWithDetails } from "./types/wallpaper";
import { loadWallpaperDetails } from "./utils/wallpaperDetails";

function App() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedAspectRatio, setSelectedAspectRatio] = useState("all");
    const [wallpapersWithDetails, setWallpapersWithDetails] = useState<WallpaperWithDetails[]>([]);
    const [activeView, setActiveView] = useState<"local" | "wallhaven">("local");

    useEffect(() => {
        let isMounted = true;

        async function loadDetails() {
            const detailedWallpapers = await Promise.all(wallpapers.map((wallpaper) => loadWallpaperDetails(wallpaper)));

            if (isMounted) {
                setWallpapersWithDetails(detailedWallpapers);
            }
        }

        loadDetails();

        return () => {
            isMounted = false;
        };
    }, []);

    const categories = ["all", ...Array.from(new Set(wallpapersWithDetails.map((wallpaper) => wallpaper.category))).sort()];

    const aspectRatioOrder = ["16:9", "21:9", "32:9", "3:2", "4:3", "1:1", "Portrait", "Other"];

    const availableAspectRatios = new Set(wallpapersWithDetails.map((wallpaper) => wallpaper.aspectRatio));

    const aspectRatios = ["all", ...aspectRatioOrder.filter((ratio) => availableAspectRatios.has(ratio))];

    const filteredWallpapers = wallpapersWithDetails.filter((wallpaper) => {
        const matchesCategory = selectedCategory === "all" || wallpaper.category === selectedCategory;

        const matchesAspectRatio = selectedAspectRatio === "all" || wallpaper.aspectRatio === selectedAspectRatio;

        return matchesCategory && matchesAspectRatio;
    });

    return (
        <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
            <section className="mx-auto max-w-7xl">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold">Wallpaper Vault</h1>
                    <p className="mt-2 text-sm text-neutral-400">Click any wallpaper to download it.</p>
                </header>

                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => setActiveView("local")}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                            activeView === "local" ? "bg-white text-neutral-950" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                        }`}
                    >
                        Local Vault
                    </button>

                    <button
                        onClick={() => setActiveView("wallhaven")}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                            activeView === "wallhaven" ? "bg-white text-neutral-950" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                        }`}
                    >
                        Wallhaven Search
                    </button>
                </div>

                {activeView === "local" ? (
                    <>
                        <div className="mb-6 space-y-4">
                            <FilterGroup title="Categories" options={categories} selectedOption={selectedCategory} onSelectOption={setSelectedCategory} />

                            <FilterGroup
                                title="Aspect Ratio"
                                options={aspectRatios}
                                selectedOption={selectedAspectRatio}
                                onSelectOption={setSelectedAspectRatio}
                            />
                        </div>

                        {wallpapersWithDetails.length === 0 ? (
                            <p className="text-neutral-400">Loading wallpapers...</p>
                        ) : (
                            <WallpaperGrid wallpapers={filteredWallpapers} />
                        )}
                    </>
                ) : (
                    <WallhavenSearch />
                )}
            </section>
        </main>
    );
}

export default App;
