// File: ./components/Pools/PoolsList.js

import React, { useEffect, useState } from 'react';

const PoolsList = () => {
  const [pools, setPools] = useState([]);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        
        const response = await fetch('http://localhost:3001/api');
        const data = await response.json();
        setPools(data);
      } catch (error) {
        console.error('Error fetching pools:', error);
      }
    };
    fetchPools();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Pool</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Yield / TVL (24H)</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Volume 24H</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">TVL</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Fees 24H</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-200">Rewards 24H</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {pools.map((pool) => (
            <tr key={pool.pool_address}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                {pool.token_a_symbol}/{pool.token_b_symbol}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                {pool.yield_24h.toFixed(2)}% / ${pool.tvl.toLocaleString()}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                ${pool.volume_24h.toLocaleString()}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                ${pool.tvl.toLocaleString()}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                ${pool.fees_24h.toLocaleString()}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                ${pool.rewards_24h.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PoolsList;
