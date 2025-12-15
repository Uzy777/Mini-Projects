const CountryCard = ({ name, flag, region, capital, population }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 w-64 mx-auto my-4 hover:shadow-lg transition-shadow dark:bg-gray-900 dark:text-white">
            <img src={flag} alt={`${name} flag`} className="w-full h-32 object-cover rounded-t-lg" />
            <h2 className="text-xl font-bold mt-2">{name}</h2>
            <p className="text-gray-700 dark:text-white">Region: {region}</p>
            <p className="text-gray-700 dark:text-white">Capital: {capital}</p>
            <p className="text-gray-700 dark:text-white">Population: {population}</p>
        </div>
    );
};

export default CountryCard;
