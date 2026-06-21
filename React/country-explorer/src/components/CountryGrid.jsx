import CountryCard from "./CountryCard";

const CountryGrid = ({ countries, onSelect }) => {
    if (countries.length === 0) {
        return <h2 className="dark:text-white">Loading...</h2>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {countries.map((country) => (
                <CountryCard
                    key={country.codes.alpha_3}
                    country={country}
                    name={country.names.common}
                    flag={country.flag.url_png || country.flag.url_svg}
                    region={country.region}
                    capital={country.capitals?.[0]?.name || "N/A"}
                    population={country.population}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
};

export default CountryGrid;
