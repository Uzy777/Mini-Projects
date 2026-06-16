import { useState } from "react";
import CategoryFilter from "./components/CategoryFilter";
import WallpaperGrid from "./components/WallpaperGrid";
import { wallpapers } from "./data/wallpapers";

function App() {
    const [selectedCategory, setSelectedCategory] = useState("all");

    const categories = ["all", ...new Set(wallpapers.map((wallpaper) => wallpaper.category))];

    const filteredWallpapers = selectedCategory === "all" ? wallpapers : wallpapers.filter((wallpaper) => wallpaper.category === selectedCategory);

    return (
        <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
            <section className="mx-auto max-w-7xl">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold">Wallpaper Dashboard</h1>
                    <p className="mt-2 text-sm text-neutral-400">Click any wallpaper to download it.</p>
                </header>

                <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

                <WallpaperGrid wallpapers={filteredWallpapers} />
            </section>
        </main>
    );
}

export default App;
