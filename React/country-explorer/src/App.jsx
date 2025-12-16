import { useEffect, useState } from "react";
import "./App.css";

import CountryCard from "./components/CountryCard";

import { MapContainer, TileLayer } from "react-leaflet";

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

    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all?fields=name,flags,capital,population,region,subregion,languages,currencies,borders,area")
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

    return (
        <div className={isDark ? "dark" : ""}>
            <button className="bg-gray-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 ml-3" onClick={() => setIsDark(!isDark)}>
                Toggle theme
            </button>

            <h1 className="text-4xl text-center font-bold mt-8">Country Explorer</h1>
            <h2 className="text-xl text-center text-gray-700">Browse and learn about countries around the world!</h2>

            <div className="flex justify-center pt-5">
                <input
                    type="text"
                    placeholder="Search countries"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="broder p-2 text-cente border border-gray-500"
                ></input>
            </div>

            <div className="flex space-x-4 justify-center pt-5">
                {regionArray.map((region) => (
                    <button
                        key={region}
                        className={
                            regionFilter === region
                                ? "bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        }
                        onClick={() => setRegionFilter(region)}
                    >
                        {region}
                    </button>
                ))}
            </div>

            <div className="flex space-x-2 justify-center pt-5">
                <select value={countrySort} onChange={(e) => setCountrySort(e.target.value)}>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="capital">Capital</option>
                    <option value="population">Population</option>
                </select>
                <button
                    className="pl-2 bg-blue-300"
                    onClick={() => {
                        setCoutnrySortDirection(countrySortDirection === "asc" ? "desc" : "asc");
                    }}
                >
                    Sort Direction {countrySortDirection === "asc" ? "\u2191" : "\u2193"}
                </button>
            </div>

            {countries.length === 0 ? (
                <h2>Loading...</h2>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {sortedCountries.map((country) => (
                        <CountryCard
                            key={country.name.common}
                            country={country}
                            name={country.name.common}
                            flag={country.flags.png}
                            region={country.region}
                            capital={country.capital ? country.capital[0] : "N/A"}
                            population={country.population}
                            onSelect={setSelectedCountry}
                        />
                    ))}
                </div>
            )}
            {selectedCountry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-xl bg-white text-gray-900 shadow-xl dark:bg-gray-900 dark:text-white">
                        {/* Flag */}
                        <div className="flex justify-center bg-gray-100 p-4 dark:bg-gray-800">
                            <img src={selectedCountry.flags.png} alt={`${selectedCountry.name.common} flag`} className="max-h-44 object-contain" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Title */}
                            <div className="text-center">
                                <h2 className="text-3xl font-bold">{selectedCountry.name.common}</h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {selectedCountry.region}
                                    {selectedCountry.subregion && ` - ${selectedCountry.subregion}`}
                                </p>
                            </div>

                            {/* Capital */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Capital</p>
                                    <p className="text-sm">{selectedCountry.capital?.[0] || "N/A"}</p>
                                </div>

                                {/* Population */}
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Population</p>
                                    <p className="text-sm">{selectedCountry.population.toLocaleString()}</p>
                                </div>

                                {/* Area */}
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Area</p>
                                    <p className="text-sm">{selectedCountry.area.toLocaleString()} km²</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <hr className="border-gray-200 dark:border-gray-700" />

                            {/* Languages */}
                            <div>
                                <p className="mb-2 text-sm font-semibold">Languages</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(selectedCountry.languages).map(([code, name]) => (
                                        <span key={code} className="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">
                                            {name} ({code})
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Currencies */}
                            <div>
                                <p className="mb-2 text-sm font-semibold">Currencies</p>
                                <div className="space-y-1">
                                    {Object.entries(selectedCountry.currencies).map(([code, currency]) => (
                                        <p key={code} className="text-sm">
                                            {currency.name} ({currency.symbol}) - {code}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Borders */}
                            <div>
                                <p className="mb-2 text-sm font-semibold">Bordering Countries</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCountry.borders.map((border) => (
                                        <span key={border} className="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">
                                            {border}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <hr className="border-gray-200 dark:border-gray-700" />

                            {/* Map Placeholder */}
                            {/* <h3 className="text-center text-lg font-semibold">Map</h3>
                            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-200 text-sm text-gray-500 dark:bg-gray-800">
                                Map coming soon
                            </div> */}

                            <h3 className="text-center text-lg font-semibold">Map</h3>
                            <div className="w-full h-64 rounded-lg overflow-hidden">
                                <MapContainer
                                    center={[51.505, -0.09]} // London (hardcoded test)
                                    zoom={5}
                                    className="h-full w-full"
                                >
                                    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                </MapContainer>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end border-t border-gray-200 p-4 dark:border-gray-700">
                            <button onClick={() => setSelectedCountry(null)} className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
