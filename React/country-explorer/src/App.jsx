import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import CountryCard from "./components/CountryCard";

const countries = [
    {
        name: "Japan",
        flag: "https://flagcdn.com/w320/jp.png",
        region: "Asia",
        capital: "Tokyo",
        population: "125800000",
    },
    {
        name: "Germany",
        flag: "https://flagcdn.com/w320/de.png",
        region: "Europe",
        capital: "Berlin",
        population: "83019200",
    },
    {
        name: "Brazil",
        flag: "https://flagcdn.com/w320/br.png",
        region: "Americas",
        capital: "Brasila",
        population: "211050000",
    },
];

function App() {
    return (
        <>
            <h1>Country Explorer</h1>
            <h2>Browse and learn about countries around the world!</h2>
            <div>
                {countries.map((country) => (
                    <CountryCard
                        key={country.name}
                        name={country.name}
                        flag={country.flag}
                        region={country.region}
                        capital={country.capital}
                        population={country.population}
                    />
                ))}
            </div>
        </>
    );
}

export default App;
