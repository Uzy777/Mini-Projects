import CountryMap from "./CountryMap";

const CountryModal = ({ country, onClose, geoJsonFeature }) => {
    if (!country) {
        return null;
    }

    const name = country.names?.common ?? "Unknown";

    const flag = country.flag?.url_png ?? null;

    const flagDescription = country.flag?.description ?? `${name} flag`;

    const capital = country.capitals?.[0]?.name ?? "N/A";

    const population = country.population ?? 0;

    const area = country.area?.kilometers ?? 0;

    const languages = Array.isArray(country.languages) ? country.languages : [];

    const currencies = country.currencies && typeof country.currencies === "object" ? Object.entries(country.currencies) : [];

    const latlng = [country.coordinates?.lat ?? 0, country.coordinates?.lng ?? 0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="flex w-full max-w-3xl max-h-screen flex-col overflow-hidden rounded-xl bg-white text-gray-900 shadow-xl dark:bg-gray-900 dark:text-white">
                {/* Flag */}
                <div className="flex justify-center bg-gray-100 p-4 dark:bg-gray-800">
                    {flag && <img src={flag} alt={flagDescription} className="max-h-44 object-contain" />}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Title */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">{name}</h2>

                        <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                            {country.region}

                            {country.subregion && ` - ${country.subregion}`}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                            <p className="text-base font-semibold uppercase text-gray-500 dark:text-gray-400">Capital</p>

                            <p className="text-base">{capital}</p>
                        </div>

                        <div>
                            <p className="text-base font-semibold uppercase text-gray-500 dark:text-gray-400">Population</p>

                            <p className="text-base">{population.toLocaleString()}</p>
                        </div>

                        <div>
                            <p className="text-base font-semibold uppercase text-gray-500 dark:text-gray-400">Area</p>

                            <p className="text-base">{area.toLocaleString()} km²</p>
                        </div>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Languages */}
                    <div>
                        <p className="mb-2 text-base font-semibold">Languages</p>

                        <div className="flex flex-wrap gap-2">
                            {languages.length > 0 ? (
                                languages.map((language, index) => {
                                    const code = language.bcp47 ?? language.iso639_3 ?? language.iso_639_3 ?? "";

                                    return (
                                        <span key={code || `${language.name}-${index}`} className="rounded bg-gray-200 px-2 py-1 text-base dark:bg-gray-700">
                                            {language.name ?? language.native_name ?? "Unknown"}

                                            {code && ` (${code})`}
                                        </span>
                                    );
                                })
                            ) : (
                                <p className="text-base">N/A</p>
                            )}
                        </div>
                    </div>

                    {/* Currencies */}
                    <div>
                        <p className="mb-2 text-base font-semibold">Currencies</p>

                        <div className="space-y-1">
                            {currencies.length > 0 ? (
                                currencies.map(([code, currency]) => (
                                    <p key={code} className="text-base">
                                        {currency.name ?? code}

                                        {currency.symbol && ` (${currency.symbol})`}

                                        {` - ${code}`}
                                    </p>
                                ))
                            ) : (
                                <p className="text-base">N/A</p>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    <CountryMap latlng={latlng} geoJsonFeature={geoJsonFeature} />
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
