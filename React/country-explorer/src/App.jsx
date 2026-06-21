import { useEffect, useRef, useState } from "react";
import "./App.css";

// Components
import CountryGrid from "./components/CountryGrid";
import CountryModal from "./components/CountryModal";

// Components - Filters
import RegionFilter from "./components/filters/RegionFilter";
import SearchInput from "./components/filters/SearchInput";
import SortControls from "./components/filters/SortControls";

// Components - UI
import ThemeToggle from "./components/ui/ThemeToggle";

// Data
import countriesGeoJson from "./data/countries.json";

const RESPONSE_FIELDS = [
    "names.common",
    "flag.url_png",
    "flag.url_svg",
    "flag.description",
    "capitals",
    "population",
    "region",
    "subregion",
    "codes.alpha_3",
    "languages",
    "currencies",
    "coordinates.lat",
    "coordinates.lng",
    "area.kilometers",
].join(",");

async function fetchCountriesPage(offset) {
    const searchParams = new URLSearchParams({
        limit: "100",
        offset: String(offset),
        response_fields: RESPONSE_FIELDS,
    });

    const response = await fetch(`/api/restcountries?${searchParams.toString()}`);

    const result = await response.json();

    if (!response.ok) {
        const errorMessage = result.errors?.map((error) => error.message).join(", ") || `REST Countries request failed with status ${response.status}`;

        throw new Error(errorMessage);
    }

    if (!Array.isArray(result.data?.objects)) {
        throw new Error("REST Countries returned an unexpected response.");
    }

    return result.data;
}

async function fetchAllCountries() {
    const countries = [];

    let offset = 0;
    let hasMoreCountries = true;

    while (hasMoreCountries) {
        const page = await fetchCountriesPage(offset);

        countries.push(...page.objects);

        hasMoreCountries = page.meta?.more === true;

        const receivedCount = page.meta?.count ?? page.objects.length;

        if (receivedCount === 0) {
            break;
        }

        offset += receivedCount;
    }

    const validCountries = countries.filter((country) => {
        const name = country.names?.common?.trim();
        const code = country.codes?.alpha_3?.trim();
        const flag = country.flag?.url_png?.trim() || country.flag?.url_svg?.trim();

        return Boolean(name && code && flag);
    });

    const uniqueCountries = Array.from(new Map(validCountries.map((country) => [country.codes.alpha_3, country])).values());

    return uniqueCountries;
}

function App() {
    const [countries, setCountries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [regionFilter, setRegionFilter] = useState("All");
    const [countrySort, setCountrySort] = useState("alphabetical");
    const [countrySortDirection, setCountrySortDirection] = useState("asc");
    const [isDark, setIsDark] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [error, setError] = useState("");

    const hasFetchedCountries = useRef(false);

    const regionArray = ["Africa", "Americas", "Asia", "Europe", "Oceania", "All"];

    useEffect(() => {
        if (hasFetchedCountries.current) {
            return;
        }

        hasFetchedCountries.current = true;

        const loadCountries = async () => {
            try {
                setError("");

                const fetchedCountries = await fetchAllCountries();

                console.log("Countries received:", fetchedCountries.length);

                // console.log("First country:", fetchedCountries[0]);

                setCountries(fetchedCountries);
            } catch (fetchError) {
                console.error("Error fetching countries:", fetchError);

                setError(fetchError instanceof Error ? fetchError.message : "Unable to fetch countries.");
            }
        };

        loadCountries();
    }, []);

    const filteredCountries = countries.filter((country) => {
        const matchesRegion = regionFilter === "All" || country.region === regionFilter;

        const countryName = country.names?.common ?? "";

        const matchesSearch = countryName.toLowerCase().includes(searchQuery.trim().toLowerCase());

        return matchesRegion && matchesSearch;
    });

    const sortedCountries = [...filteredCountries];

    if (countrySort === "alphabetical") {
        sortedCountries.sort((a, b) => {
            const result = (a.names?.common ?? "").localeCompare(b.names?.common ?? "");

            return countrySortDirection === "asc" ? result : -result;
        });
    } else if (countrySort === "capital") {
        sortedCountries.sort((a, b) => {
            const result = (a.capitals?.[0]?.name ?? "").localeCompare(b.capitals?.[0]?.name ?? "");

            return countrySortDirection === "asc" ? result : -result;
        });
    } else if (countrySort === "population") {
        sortedCountries.sort((a, b) => {
            const result = (a.population ?? 0) - (b.population ?? 0);

            return countrySortDirection === "asc" ? result : -result;
        });
    }

    const matchesGeoJson = selectedCountry ? countriesGeoJson.features.find((feature) => feature.properties.ISO_A3 === selectedCountry.codes?.alpha_3) : null;

    return (
        <div className={isDark ? "dark" : ""}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
                <ThemeToggle onThemeToggle={() => setIsDark(!isDark)} />

                <h1 className="mt-8 text-center text-4xl font-bold dark:text-white">Country Explorer</h1>

                <h2 className="text-center text-xl text-gray-700 dark:text-white">Browse and learn about countries around the world!</h2>

                <SearchInput value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />

                <RegionFilter value={regionFilter} regions={regionArray} onChange={setRegionFilter} />

                <SortControls
                    sort={countrySort}
                    direction={countrySortDirection}
                    onSortChange={setCountrySort}
                    onDirectionToggle={() => setCountrySortDirection(countrySortDirection === "asc" ? "desc" : "asc")}
                />

                {error ? (
                    <p className="mt-8 text-center text-red-600 dark:text-red-400">{error}</p>
                ) : (
                    <CountryGrid countries={sortedCountries} onSelect={setSelectedCountry} />
                )}

                <CountryModal country={selectedCountry} geoJsonFeature={matchesGeoJson} onClose={() => setSelectedCountry(null)} />
            </div>
        </div>
    );
}

export default App;
