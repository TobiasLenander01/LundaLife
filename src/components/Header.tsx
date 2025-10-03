import { useState } from 'react';
import { FilterOption, DateFilterOptions, CategoryFilterOptions, FilterState } from '@/types/app';
import Dropdown from './Dropdown';
import Image from 'next/image';

export interface HeaderComponentProps {
  filterState: FilterState;
  handleFilterChange: (filterState: FilterState) => void;
}

type OpenDropdown = 'none' | 'category' | 'date';

export default function Header({ filterState, handleFilterChange }: HeaderComponentProps) {
  // State to manage which dropdown is open (only one at a time)
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>('none');

  // Function to handle date filter selection
  const handleSelectDateFilter = (option: FilterOption) => {
    handleFilterChange({
      ...filterState,
      dateFilter: option
    });
  };

  // Function to handle category filter selection
  const handleSelectCategoryFilter = (option: FilterOption) => {
    handleFilterChange({
      ...filterState,
      categoryFilter: option
    });
  };

  // Function to toggle dropdowns with mutual exclusivity
  const toggleDropdown = (dropdown: 'category' | 'date') => {
    setOpenDropdown(prevOpen => prevOpen === dropdown ? 'none' : dropdown);
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 sticky top-0 z-50 flex items-center select-none">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo and name - hidden on small screens */}
        <div className="hidden sm:flex items-center space-x-3">
          <Image src="/images/logo.png" alt="LundaLife Logo" width={48} height={48}/> 
          <span className="text-xl font-semibold text-gray-800">LundaLife</span>
        </div>
        
        {/* Logo only on mobile */}
        <div className="flex sm:hidden items-center">
          <Image src="/images/logo.png" alt="LundaLife Logo" width={32} height={32}/>
        </div>

        {/* Filter Section */}
        <div className="flex items-center space-x-3">
          {/* Category Filter Dropdown */}
          <Dropdown
            options={CategoryFilterOptions}
            selectedOption={filterState.categoryFilter}
            onSelect={handleSelectCategoryFilter}
            isOpen={openDropdown === 'category'}
            onToggle={() => toggleDropdown('category')}
          />

          {/* Date Filter Dropdown */}
          <Dropdown
            options={DateFilterOptions}
            selectedOption={filterState.dateFilter}
            onSelect={handleSelectDateFilter}
            isOpen={openDropdown === 'date'}
            onToggle={() => toggleDropdown('date')}
          />
        </div>
      </div>
    </header>
  );
};