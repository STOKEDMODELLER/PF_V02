import React, { useState } from "react";
import Header from "./Header";
import SearchBar from "./SearchBar";
import PoolsList from "./PoolsList";

const PoolsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-gradient-to-b from-indigo-900 to-gray-900 rounded-xl shadow-lg border border-blue-900/50 p-6">
        {/* Header */}
        <Header />
        {/* Search Bar */}
        <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        {/* Pools List */}
        <PoolsList searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default PoolsPage;
