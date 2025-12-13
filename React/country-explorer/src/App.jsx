import { useEffect, useState } from "react";
import "./App.css";

import CountryCard from "./components/CountryCard";

function App() {
    const [countries, setCountries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [regionFilter, setRegionFilter] = useState("All");

    // const filteredCountries = countries.filter((country) => country.name.common.toLowerCase().includes(searchQuery.toLowerCase()));

    const filteredCountries = countries.filter((country) => {
        const matchesRegion = regionFilter === "All" || country.region === regionFilter;

        const matchesSearch = country.name.common.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesRegion && matchesSearch;
    });

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

    console.log(regionFilter);

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

            {countries.length === 0 ? (
                <h2>Loading...</h2>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {filteredCountries.map((country) => (
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
