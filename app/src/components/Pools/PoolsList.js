import React from "react";
import PoolCard from "./PoolCard";

const PoolsList = ({ searchQuery }) => {
  // Example pool data, replace with real data or API call
  const poolData = [
    { name: "Pool 1", tokenA: "SOL", tokenB: "USDC", reserveA: 1234, reserveB: 5678 },
    { name: "Pool 2", tokenA: "ETH", tokenB: "USDC", reserveA: 2345, reserveB: 6789 },
    { name: "Pool 3", tokenA: "BTC", tokenB: "USDT", reserveA: 3456, reserveB: 7890 },
    { name: "Pool 4", tokenA: "SOL", tokenB: "USDT", reserveA: 4567, reserveB: 8901 },
    { name: "Pool 5", tokenA: "LUNA", tokenB: "USDT", reserveA: 5678, reserveB: 9012 }
  ];

  // Filter pools based on search query
  const filteredPools = poolData.filter((pool) =>
    pool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {filteredPools.length > 0 ? (
        filteredPools.map((pool, index) => <PoolCard key={index} pool={pool} />)
      ) : (
        <p className="text-gray-400 text-center">No pools found.</p>
      )}
    </div>
  );
};

export default PoolsList;
