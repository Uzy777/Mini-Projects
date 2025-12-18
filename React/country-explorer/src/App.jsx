import { useEffect, useState, useRef } from "react";
import "./App.css";

// Components
import CountryCard from "./components/CountryCard";
import CountryGrid from "./components/CountryGrid";
import CountryModal from "./components/CountryModal";

// Components - Filters
import RegionFilter from "./components/filters/RegionFilter";
import SearchInput from "./components/filters/SearchInput";
import SortControls from "./components/filters/SortControls";

// Components - UI
import ThemeToggle from "./components/ui/ThemeToggle";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import countriesGeoJson from "./data/countries.json";
import FullScreen from "leaflet.fullscreen";

function App() {
    const [countries, setCountries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [regionFilter, setRegionFilter] = useState("All");
    const [countrySort, setCountrySort] = useState("alphabetical");
    const [countrySortDirection, setCoutnrySortDirection] = useState("asc");
    const [isDark, setIsDark] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState(null);

    const regionArray = ["Africa", "Americas", "Asia", "Europe", "Oceania", "All"];

    const filteredCountries = countries.filter((country) => {
        const matchesRegion = regionFilter === "All" || country.region === regionFilter;

        const matchesSearch = country.name.common.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesRegion && matchesSearch;
    });

    const sortedCountries = [...filteredCountries];

    if (countrySort === "alphabetical") {
        sortedCountries.sort((a, b) => {
            const result = a.name.common.localeCompare(b.name.common);
            return countrySortDirection === "asc" ? result : -result;
        });
    } else if (countrySort === "capital") {
        sortedCountries.sort((a, b) => {
            const result = (a.capital?.[0] || "").localeCompare(b.capital?.[0] || "");
            return countrySortDirection === "asc" ? result : -result;
        });
    } else if (countrySort === "population") {
        sortedCountries.sort((a, b) => {
            const result = b.population - a.population;
            return countrySortDirection === "asc" ? result : -result;
        });
    }

    const matchesGeoJson = selectedCountry ? countriesGeoJson.features.find((feature) => feature.properties.ISO_A3 === selectedCountry.cca3) : null;

    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all?fields=name,flags,capital,population,region,cca3,languages,currencies,latlng,area")
            .then((response) => response.json())
            .then((data) => {
                setCountries(data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, []);

    // console.log(regionFilter);
    // console.log(countrySort);
    // console.log(isDark);
    // console.log(selectedCountry);
    // console.log(countriesGeoJson.features.length);
    // console.log(matchesGeoJson);

    return (
        <div className={isDark ? "dark" : ""}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
                <ThemeToggle onThemeToggle={() => setIsDark(!isDark)} />

                <h1 className="text-4xl text-center font-bold mt-8 dark:text-white">Country Explorer</h1>
                <h2 className="text-xl text-center text-gray-700 dark:text-white">Browse and learn about countries around the world!</h2>

                <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

                <RegionFilter value={regionFilter} regions={regionArray} onChange={setRegionFilter} />

                <SortControls
                    sort={countrySort}
                    direction={countrySortDirection}
                    onSortChange={setCountrySort}
                    onDirectionToggle={() => setCoutnrySortDirection(countrySortDirection === "asc" ? "desc" : "asc")}
                />

                <CountryGrid countries={sortedCountries} onSelect={setSelectedCountry} />

                <CountryModal country={selectedCountry} geoJsonFeature={matchesGeoJson} onClose={() => setSelectedCountry(null)} />
            </div>
        </div>
    );
}

export default App;
