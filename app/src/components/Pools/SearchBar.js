import React from "react";

const SearchBar = () => (
  <div className="relative flex flex-col max-w-md w-full bg-transparent text-[#f8fafc] overflow-visible p-4">
    <label htmlFor="search-input" className="sr-only">
      Search tokens
    </label>
    <div className="flex items-center gap-2 h-11 px-4 text-sm rounded-md border border-blue-800 focus-within:border-[#6e85f7] shadow-inner">
      <input
        id="search-input"
        type="text"
        placeholder="Search tokens..."
        spellCheck="false"
        autoComplete="off"
        autoCorrect="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="true"
        className="flex-grow bg-transparent placeholder:text-quarternary text-primary text-base font-regular py-0 px-0 border-0 focus:outline-none focus:ring-0"
      />
    </div>
  </div>
);

export default SearchBar;
