type CategoryFilterProps = {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
};

function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onSelectCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                        selectedCategory === category ? "bg-white text-neutral-950" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                    }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}

export default CategoryFilter;
