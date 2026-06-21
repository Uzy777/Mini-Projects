import { useEffect, useState } from "react";
import WallhavenCard from "./WallhavenCard";
import { searchWallhavenWallpapers } from "../services/wallhavenApi";
import type { WallhavenWallpaper } from "../types/wallhaven";

type CategorySelection = {
    general: boolean;
    anime: boolean;
    people: boolean;
};

const DEFAULT_CATEGORIES: CategorySelection = {
    general: true,
    anime: true,
    people: true,
};

const CATEGORY_STORAGE_KEY = "wallpaper-dashboard:wallhaven-categories";
const API_KEY_STORAGE_KEY = "wallpaper-dashboard:wallhaven-api-key";

function loadApiKey() {
    return localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
}

function loadCategories(): CategorySelection {
    const savedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);

    if (!savedCategories) {
        return DEFAULT_CATEGORIES;
    }

    try {
        const parsedCategories = JSON.parse(savedCategories);

        const isValid =
            typeof parsedCategories.general === "boolean" && typeof parsedCategories.anime === "boolean" && typeof parsedCategories.people === "boolean";

        if (isValid) {
            return parsedCategories;
        }

        return DEFAULT_CATEGORIES;
    } catch {
        return DEFAULT_CATEGORIES;
    }
}

function createCategoryParameter(selection: CategorySelection) {
    return [selection.general ? "1" : "0", selection.anime ? "1" : "0", selection.people ? "1" : "0"].join("");
}

function WallhavenSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<WallhavenWallpaper[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<CategorySelection>(loadCategories);
    const [apiKey, setApiKey] = useState(loadApiKey);

    useEffect(() => {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    }, [categories]);

    function toggleCategory(category: keyof CategorySelection) {
        setCategories((currentCategories) => {
            const updatedCategories = {
                ...currentCategories,
                [category]: !currentCategories[category],
            };

            const hasSelectedCategory = Object.values(updatedCategories).some(Boolean);

            return hasSelectedCategory ? updatedCategories : currentCategories;
        });
    }

    useEffect(() => {
        if (apiKey.trim()) {
            localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
        } else {
            localStorage.removeItem(API_KEY_STORAGE_KEY);
        }
    }, [apiKey]);

    async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!query.trim()) {
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const categoryParameter = createCategoryParameter(categories);
            const wallpapers = await searchWallhavenWallpapers(query, categoryParameter, apiKey);

            setResults(wallpapers);
        } catch {
            setError("Could not load wallpapers.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section>
            <div className="mb-6">
                <label htmlFor="wallhaven-api-key" className="mb-2 block text-sm font-medium text-neutral-400">
                    Wallhaven API Key
                </label>
                <input
                    id="wallhaven-api-key"
                    type="password"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder="Enter your Wallhaven API key"
                    autoComplete="off"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-600"
                />
                <p className="mt-2 text-xs text-neutral-500">Stored only in this browser.</p>
            </div>

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

            <div className="mb-6">
                <p className="mb-2 text-sm font-medium text-neutral-400">Categories</p>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        aria-pressed={categories.general}
                        onClick={() => toggleCategory("general")}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                            categories.general ? "bg-white text-neutral-950" : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                        }`}
                    >
                        General
                    </button>

                    <button
                        type="button"
                        aria-pressed={categories.anime}
                        onClick={() => toggleCategory("anime")}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                            categories.anime ? "bg-white text-neutral-950" : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                        }`}
                    >
                        Anime
                    </button>

                    <button
                        type="button"
                        aria-pressed={categories.people}
                        onClick={() => toggleCategory("people")}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                            categories.people ? "bg-white text-neutral-950" : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                        }`}
                    >
                        People
                    </button>
                </div>
            </div>

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
