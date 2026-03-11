import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FilterButtons = ({ selectedCategory, onCategoryChange }) => {
  const scrollRef = useRef(null);
  
  const categories = [
    'All',
    'Music',
    'Gaming',
    'News',
    'Sports',
    'Education',
    'Technology',
    'Comedy',
    'Entertainment',
    'Travel',
    'Food',
    'Fashion',
    'Podcasts'
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  return (
    <div className="relative flex items-center">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 z-10 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div
        ref={scrollRef}
        className="flex space-x-3 overflow-x-auto scrollbar-hide px-10 py-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 z-10 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default FilterButtons;