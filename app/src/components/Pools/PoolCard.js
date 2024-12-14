import React from "react";

const PoolCard = ({ pool }) => {
  if (!pool) {
    // If pool is undefined or null, return null or a fallback UI
    return <div className="text-gray-400">Loading pool...</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded-md shadow-lg border border-gray-700 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-white">{pool.name}</h3>
        <p className="text-sm text-gray-300">{pool.tokenA} / {pool.tokenB}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">Reserves: {pool.reserveA} / {pool.reserveB}</p>
      </div>
    </div>
  );
};

export default PoolCard;
