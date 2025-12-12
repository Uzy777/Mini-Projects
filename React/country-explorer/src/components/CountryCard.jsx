const CountryCard = ({ name, flag, region, capital, population }) => {
    return (
        <div>
            <p>
                {name} {flag} {region} {capital} {population}
            </p>
        </div>
    );
};

export default CountryCard;
