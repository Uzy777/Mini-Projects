type FilterGroupProps = {
    title: string;
    options: string[];
    selectedOption: string;
    onSelectOption: (option: string) => void;
};

function formatFilterLabel(option: string) {
    if (option === "all") {
        return "All";
    }

    return option.replaceAll("-", " ");
}

function FilterGroup({ title, options, selectedOption, onSelectOption }: FilterGroupProps) {
    return (
        <div>
            <h2 className="mb-2 text-sm font-medium text-neutral-400">{title}</h2>

            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option}
                        onClick={() => onSelectOption(option)}
                        className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                            selectedOption === option ? "bg-white text-neutral-950" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                        }`}
                    >
                        {formatFilterLabel(option)}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default FilterGroup;
