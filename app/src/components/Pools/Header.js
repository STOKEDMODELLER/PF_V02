import React from "react";

const Header = ({ isDropdownOpen, toggleDropdown }) => (
  <div className="w-full px-4 py-3 flex justify-between items-center border-b border-gray-700 bg-gray-800">
    <h1 className="text-2xl font-semibold">Pools</h1>

    <div className="relative">
      {/* Mobile View (Dropdown) */}
      <div className="sm:hidden">
        <button
          className="bg-gradient-to-b from-blue-700 to-blue-800 px-4 py-2 rounded-md text-base font-medium flex items-center gap-2 shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={toggleDropdown}
        >
          Create
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transform transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
            <a
              href="/create-token"
              className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Create Token
            </a>
            <a
              href="/create-pool"
              className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              Create Pool
            </a>
          </div>
        )}
      </div>

      {/* Normal View (Separate Buttons) */}
      <div className="hidden sm:flex gap-2">
        <a
          href="/create-token"
          className="bg-gradient-to-b from-blue-700 to-blue-800 px-4 py-2 rounded-md text-base font-medium shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Create Token
        </a>
        <a
          href="/create-pool"
          className="bg-gradient-to-b from-blue-700 to-blue-800 px-4 py-2 rounded-md text-base font-medium shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Create Pool
        </a>
      </div>
    </div>
  </div>
);

export default Header;
