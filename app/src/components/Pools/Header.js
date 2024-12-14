import React, { useState } from "react";

const Header = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-white">Pools</h1>
      <div className="flex gap-4 sm:hidden">
        {/* Mobile View Dropdown Button */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-b from-blue-700 to-blue-800 text-white rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 whitespace-nowrap"
            style={{ whiteSpace: "nowrap" }} // Explicitly ensure no wrapping
          >
            Create
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transform transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
              <a href="/create-pool" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">
                Create Pool
              </a>
              <a href="/create-token" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">
                Create Token
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Desktop View Buttons */}
      <div className="hidden sm:flex gap-4">
        <button className="px-4 py-2 text-sm font-medium bg-gradient-to-b from-blue-700 to-blue-800 text-white rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 whitespace-nowrap">
          Create Pool
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-gradient-to-b from-green-700 to-green-800 text-white rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 whitespace-nowrap">
          Create Token
        </button>
      </div>
    </div>
  );
};

export default Header;
