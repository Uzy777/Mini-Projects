const RegionFilter = ({ value, regions, onChange }) => {
    return (
        <div className="flex space-x-4 justify-center pt-5">
            {regions.map((region) => (
                <button
                    key={region}
                    className={
                        value === region
                            ? "bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    }
                    onClick={() => onChange(region)}
                >
                    {region}
                </button>
            ))}
        </div>
    );
};

export default RegionFilter;
