import { useState, useRef } from 'react';
import { FilterOption, FilterOptions } from '@/types/app';

export interface HeaderComponentProps {
  selectedFilter: FilterOption;
  handleFilterChange: (filter: FilterOption) => void;
}

export default function Header({selectedFilter, handleFilterChange }: HeaderComponentProps) {
  // State to manage dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to handle filter selection
  const handleSelectFilter = (option: FilterOption) => {
    handleFilterChange(option);
    setIsDropdownOpen(false);
  };

  return (
    
    <header className="bg-white shadow-md px-6 py-4 sticky top-0 z-50 flex items-center select-none">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo and name */}
        <div className="flex items-center space-x-3">
          <img src="/images/logo.png" alt="LundaLife Logo" className="h-12 w-auto" /> 
          <span className="text-xl font-semibold text-gray-800">LundaLife</span>
        </div>

        {/* Filter Section */}
        <div className="flex items-center space-x-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md inline-flex items-center transition-colors duration-150 ease-in-out"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <span>{selectedFilter.label}</span>
              <svg
                className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : 'rotate-0'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20"
                role="menu"
              >
                {FilterOptions.map((option) => (
                  <li key={option.value}>
                    <button
                      onClick={() => handleSelectFilter(option)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      role="menuitem"
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};