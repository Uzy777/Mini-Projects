import { useState } from "react";
import WallhavenCard from "./WallhavenCard";
import { searchWallhavenWallpapers } from "../services/wallhavenApi";
import type { WallhavenWallpaper } from "../types/wallhaven";

function WallhavenSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<WallhavenWallpaper[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!query.trim()) {
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const wallpapers = await searchWallhavenWallpapers(query);
            setResults(wallpapers);
        } catch {
            setError("Could not load wallpapers. The API may be blocked by CORS.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section>
            <form onSubmit={handleSearch} className="mb-6 flex gap-3">
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search Wallhaven..."
                    className="min-w-0 flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-600"
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoading ? "Searching..." : "Search"}
                </button>
            </form>

            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((wallpaper) => (
                    <WallhavenCard key={wallpaper.id} wallpaper={wallpaper} />
                ))}
            </div>
        </section>
    );
}

export default WallhavenSearch;
