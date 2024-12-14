import React from "react";

const SearchBar = ({ searchQuery, onSearchChange }) => (
  <div className="relative mb-6">
    <input
      type="text"
      placeholder="Search pools..."
      value={searchQuery}
      onChange={onSearchChange}
      className="w-full h-12 px-4 text-sm bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default SearchBar;
