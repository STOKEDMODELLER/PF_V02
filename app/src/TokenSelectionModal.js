// src/TokenSelectionModal.js

import React, { useState, useEffect } from "react";
import defaultImage from "./assets/default_image.png"; // Adjust the path if needed
import { searchTokens } from "./tokenService"; // Import the search function
import debounce from "lodash.debounce";

const TokenSelectionModal = ({ tokens, onSelectToken, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(tokens);

  // Debounced search function
  const debouncedSearch = debounce(async (term) => {
    if (term.length === 0) {
      setSearchResults(tokens);
    } else {
      const results = await searchTokens(term);
      setSearchResults(results);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);

    // Cleanup function
    return () => {
      debouncedSearch.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-[#1e223a] p-4 rounded-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select a Token</h2>
          <button
            onClick={onClose}
            className="text-gray-400 text-2xl font-bold focus:outline-none"
          >
            &times;
          </button>
        </div>
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search token"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 bg-[#2d3150] rounded focus:outline-none"
        />
        {/* Token List */}
        <div className="max-h-64 overflow-y-auto">
          {searchResults.map((token, index) => (
            <div
              key={`${token.address}-${index}`}
              className="flex items-center p-2 cursor-pointer hover:bg-[#2d3150] rounded"
              onClick={() => {
                onSelectToken(token);
                onClose();
              }}
            >
              <img
                src={token.logoURI || defaultImage}
                alt={token.symbol}
                className="h-6 w-6 rounded-full mr-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImage;
                }}
              />
              <div>
                <div className="font-semibold">{token.symbol}</div>
                <div className="text-sm text-gray-400">{token.name}</div>
              </div>
            </div>
          ))}
          {searchResults.length === 0 && (
            <div className="text-center text-gray-500">No tokens found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenSelectionModal;
