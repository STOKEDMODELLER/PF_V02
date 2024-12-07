import React from "react";
import PropTypes from "prop-types";

const TokenRow = ({ token, onSelect, balance }) => (
  <li
    className="flex items-center justify-between px-4 py-3 hover:bg-gray-800 cursor-pointer"
    onClick={() => onSelect(token)}
  >
    {/* Token Info */}
    <div className="flex items-center gap-3">
      <img
        src={token.metadata?.image || "https://via.placeholder.com/40"}
        alt={token.metadata?.symbol || "Token"}
        className="w-8 h-8 rounded-full"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">{token.metadata?.symbol}</span>
        <span className="text-xs text-gray-400">{token.metadata?.name}</span>
      </div>
    </div>

    {/* Balance */}
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-gray-400">{balance}</span>
    </div>
  </li>
);

TokenRow.propTypes = {
  token: PropTypes.shape({
    metadata: PropTypes.shape({
      image: PropTypes.string,
      symbol: PropTypes.string,
      name: PropTypes.string,
    }),
    address: PropTypes.string.isRequired,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  balance: PropTypes.number.isRequired,
};

export default TokenRow;
