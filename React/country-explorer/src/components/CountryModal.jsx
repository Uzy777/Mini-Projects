import CountryMap from "./CountryMap";

const CountryModal = ({ country, onClose, geoJsonFeature }) => {
    if (!country) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="flex w-full max-w-3xl max-h-screen flex-col overflow-hidden rounded-xl bg-white text-gray-900 shadow-xl dark:bg-gray-900 dark:text-white">
                {/* Flag */}
                <div className="flex justify-center bg-gray-100 p-4 dark:bg-gray-800">
                    <img src={country.flags.png} alt={`${country.name.common} flag`} className="max-h-44 object-contain" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Title */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">{country.name.common}</h2>
                        <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                            {country.region}
                            {country.subregion && ` - ${country.subregion}`}
                        </p>
                    </div>

                    {/* Capital */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <p className="text-base font-semibold uppercase text-gray-500 dark:text-gray-400">Capital</p>
                            <p className="text-base">{country.capital?.[0] || "N/A"}</p>
                        </div>

                        {/* Population */}
                        <div>
                            <p className="text-base font-semibold uppercase text-gray-500 dark:text-gray-400">Population</p>
                            <p className="text-base">{country.population.toLocaleString()}</p>
                        </div>

                        {/* Area */}
                        <div>
                            <p className="text-base font-semibold uppercase text-gray-500 dark:text-gray-400">Area</p>
                            <p className="text-base">{country.area.toLocaleString()} km²</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Languages */}
                    <div>
                        <p className="mb-2 text-base font-semibold">Languages</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(country.languages).map(([code, name]) => (
                                <span key={code} className="rounded bg-gray-200 px-2 py-1 text-base dark:bg-gray-700">
                                    {name} ({code})
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Currencies */}
                    <div>
                        <p className="mb-2 text-base font-semibold">Currencies</p>
                        <div className="space-y-1">
                            {Object.entries(country.currencies).map(([code, currency]) => (
                                <p key={code} className="text-base">
                                    {currency.name} ({currency.symbol}) - {code}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Borders */}
                    {/* <div>
                                <p className="mb-2 text-base font-semibold">Bordering Countries</p>
                                <div className="flex flex-wrap gap-2">
                                    {country.borders.map((border) => (
                                        <span key={border} className="rounded bg-gray-200 px-2 py-1 text-base dark:bg-gray-700">
                                            {border}
                                        </span>
                                    ))}
                                </div>
                            </div> */}

                    {/* Divider */}
                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Map */}
                    <CountryMap latlng={country.latlng} geoJsonFeature={geoJsonFeature} />
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-gray-200 p-4 dark:border-gray-700">
                    <button onClick={onClose} className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CountryModal;
