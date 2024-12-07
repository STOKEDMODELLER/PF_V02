// File: src/components/TokenSelector/TokenSelector.js
import React, { useState } from "react";
import PropTypes from "prop-types";
import LazyTokenList from "./LazyTokenList";

const TokenSelector = ({ onSelectToken, onClose, connection, tokens }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  return (
    <div className="flex flex-col gap-y-4 max-h-full">
      {/* Search Section */}
      <div className="sticky top-0 z-10 px-4 py-3 bg-gray-900">
        <div className="flex items-center bg-gray-800 text-white rounded-md px-3 py-2">
          <input
            className="w-full bg-transparent focus:outline-none placeholder-gray-400"
            placeholder="Search tokens, name, or address"
            value={searchTerm}
            onChange={handleInputChange}
            autoFocus
          />
        </div>
      </div>

      {/* Token List Section */}
      <LazyTokenList
        onSelectToken={onSelectToken}
        searchTerm={searchTerm}
        connection={connection}
        tokens={tokens}
      />
    </div>
  );
};

TokenSelector.propTypes = {
  onSelectToken: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  connection: PropTypes.object.isRequired,
  tokens: PropTypes.array.isRequired,
};

export default TokenSelector;
