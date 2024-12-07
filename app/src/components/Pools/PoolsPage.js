import React, { useState } from "react";
import Header from "./Header";
import SearchBar from "./SearchBar";
import ActionButtons from "./ActionButtons";
import PoolsList from "./PoolsList";

const PoolsPage = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  return (
    <div className="flex flex-col bg-gray-900 text-white" style={{ width: "100%" }}>
      <Header isDropdownOpen={isDropdownOpen} toggleDropdown={toggleDropdown} />
      <div className="flex items-center justify-between gap-3 px-3 lg:px-0 flex-wrap sm:flex-nowrap">
        <SearchBar />
        <ActionButtons />
      </div>
      <PoolsList />
    </div>
  );
};

export default PoolsPage;
