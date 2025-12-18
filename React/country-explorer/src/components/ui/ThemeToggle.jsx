const ThemeToggle = ({ onThemeToggle }) => {
    return (
        <button className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 ml-3" onClick={onThemeToggle}>
            Toggle theme
        </button>
    );
};

export default ThemeToggle;
