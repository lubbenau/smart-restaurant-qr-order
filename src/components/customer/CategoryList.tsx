import React from 'react';

interface CategoryListProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex overflow-x-auto scrollbar-none gap-4 py-3 px-1 -mx-6 md:mx-0 px-6 md:px-0">
      {categories.map((category) => {
        const isActive = selectedCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`whitespace-nowrap text-sm font-medium transition-all duration-300 py-1 relative ${
              isActive
                ? 'text-gray-900 font-bold scale-105'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {category}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#046A55] rounded-full animation-fade-in" />
            )}
          </button>
        );
      })}
    </div>
  );
};
export default CategoryList;
