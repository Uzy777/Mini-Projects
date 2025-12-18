const SearchInput = ({ value, onChange }) => {
    return (
        <div className="flex justify-center pt-5">
            <input
                type="text"
                placeholder="Search countries"
                value={value}
                onChange={onChange}
                className="broder p-2 text-center border border-gray-500 dark:bg-gray-900 dark:text-white"
            ></input>
        </div>
    );
};

export default SearchInput;
