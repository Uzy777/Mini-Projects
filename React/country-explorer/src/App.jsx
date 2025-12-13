import { useEffect, useState } from "react";
import "./App.css";

import CountryCard from "./components/CountryCard";

function App() {
    const [countries, setCountries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [regionFilter, setRegionFilter] = useState("All");
    const [countrySort, setCountrySort] = useState("alphabetical");
    const [countrySortDirection, setCoutnrySortDirection] = useState("asc");

    // const filteredCountries = countries.filter((country) => country.name.common.toLowerCase().includes(searchQuery.toLowerCase()));

    const filteredCountries = countries.filter((country) => {
        const matchesRegion = regionFilter === "All" || country.region === regionFilter;

        const matchesSearch = country.name.common.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesRegion && matchesSearch;
    });

    const sortedCountries = [...filteredCountries];

    if (countrySort === "alphabetical" && countrySortDirection === "asc") {
        sortedCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    } else if (countrySort === "alphabetical" && countrySortDirection === "desc") {
        sortedCountries.sort((a, b) => b.name.common.localeCompare(a.name.common));
    } else if (countrySort === "capital" && countrySortDirection === "asc") {
        sortedCountries.sort((a, b) => (a.capital?.[0] || "").localeCompare(b.capital?.[0] || ""));
    } else if (countrySort === "capital" && countrySortDirection === "desc") {
        sortedCountries.sort((a, b) => (b.capital?.[0] || "").localeCompare(a.capital?.[0] || ""));
    } else if (countrySort === "population" && countrySortDirection === "asc") {
        sortedCountries.sort((a, b) => b.population - a.population);
    } else if (countrySort === "population" && countrySortDirection === "desc") {
        sortedCountries.sort((a, b) => a.population - b.population);
    }

    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all?fields=name,flags,capital,population,region")
            .then((response) => response.json())
            .then((data) => {
                setCountries(data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, []);

    // console.log(regionFilter);
    console.log(countrySort);

    return (
        <>
            <h1 className="text-4xl text-center font-bold mt-8">Country Explorer</h1>
            <h2 className="text-xl text-center text-gray-700">Browse and learn about countries around the world!</h2>

            <div className="flex justify-center pt-5">
                <input
                    type="text"
                    placeholder="Search countries"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="broder p-2 text-center"
                ></input>
            </div>

            <div className="flex space-x-4 justify-center pt-5">
                <button
                    className={
                        regionFilter === "Africa"
                            ? "bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    }
                    onClick={() => {
                        setRegionFilter("Africa");
                    }}
                >
                    Africa
                </button>

                <button
                    className={
                        regionFilter === "Americas"
                            ? "bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    }
                    onClick={() => {
                        setRegionFilter("Americas");
                    }}
                >
                    Americas
                </button>
                <button
                    className={
                        regionFilter === "Asia"
                            ? "bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    }
                    onClick={() => {
                        setRegionFilter("Asia");
                    }}
                >
                    Asia
                </button>
                <button
                    className={
                        regionFilter === "Europe"
                            ? "bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    }
                    onClick={() => {
                        setRegionFilter("Europe");
                    }}
                >
                    Europe
                </button>
                <button
                    className={
                        regionFilter === "Oceania"
                            ? "bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    }
                    onClick={() => {
                        setRegionFilter("Oceania");
                    }}
                >
                    Oceania
                </button>
                <button
                    className={
                        regionFilter === "All"
                            ? "bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    }
                    onClick={() => {
                        setRegionFilter("All");
                    }}
                >
                    All
                </button>
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
                            name={country.name.common}
                            flag={country.flags.png}
                            region={country.region}
                            capital={country.capital ? country.capital[0] : "N/A"}
                            population={country.population}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

export default App;
