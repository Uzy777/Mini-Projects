import CountryCard from "./CountryCard";

const CountryGrid = ({ countries, onSelect }) => {
    if (countries.length === 0) {
        return <h2 className="dark:text-white">Loading...</h2>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {countries.map((country) => (
                <CountryCard
                    key={country.name.common}
                    country={country}
                    name={country.name.common}
                    flag={country.flags.png}
                    region={country.region}
                    capital={country.capital ? country.capital[0] : "N/A"}
                    population={country.population}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
};

export default CountryGrid;
