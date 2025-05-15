"use client";

import { useState } from "react";
import { LiaSearchSolid } from "react-icons/lia";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    // TODO: SEARCH LOGIC
    console.log("Searching for:", searchQuery);
  };

  return (
    <div
      className="
        fixed 
        top-4 
        left-1/2 
        transform 
        -translate-x-1/2 
        bg-white 
        rounded-4xl 
        shadow-2xl 
        shadow-gray-700 
        z-40 
        px-6 
        py-3 
        flex 
        items-center
        w-[80%] 
        max-w-xl
        border-2
        border-gray-300
        hover:border-gray-400
      "
    >
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="
          w-full 
          outline-none 
          bg-transparent 
          text-gray-700 
          placeholder-gray-400
          pr-2
        "
      />
      <button
        onClick={handleSearch}
        className="text-gray-400 hover:text-blue-700 hover:cursor-pointer transition"
        aria-label="Search"
      >
        <LiaSearchSolid className="h-6 w-6" />
      </button>
    </div>
  );
}
