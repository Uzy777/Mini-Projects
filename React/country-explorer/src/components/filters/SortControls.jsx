const SortControls = ({ sort, direction, onSortChange, onDirectionToggle }) => {
    return (
        <div className="flex space-x-2 justify-center pt-5">
            <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
                <option value="alphabetical">Alphabetical</option>
                <option value="capital">Capital</option>
                <option value="population">Population</option>
            </select>
            <button className="pl-2 bg-blue-300" onClick={onDirectionToggle}>
                Sort Direction {direction === "asc" ? "\u2191" : "\u2193"}
            </button>
        </div>
    );
};

export default SortControls;
