import React, { createContext, useContext, useState } from "react";

const PriceContext = createContext();

export const PriceProvider = ({ children }) => {
  const [priceCache, setPriceCache] = useState({});

  const fetchPrice = async (tokenAId, tokenBId) => {
    const cacheKey = `${tokenAId}-${tokenBId}`;
    const now = Date.now();

    // Return cached price if it's still valid
    if (priceCache[cacheKey] && now - priceCache[cacheKey].timestamp < 5000) {
      return priceCache[cacheKey].price;
    }

    try {
      const response = await fetch(`https://api.jup.ag/price/v2?ids=${tokenAId},${tokenBId}`);
      const data = await response.json();
      if (data?.data && data.data[tokenAId]?.price) {
        const price = parseFloat(data.data[tokenAId].price);
        setPriceCache((prev) => ({
          ...prev,
          [cacheKey]: { price, timestamp: now },
        }));
        return price;
      }
    } catch (error) {
      console.error("Error fetching price:", error);
    }
    return null;
  };

  const clearCache = () => setPriceCache({});

  return (
    <PriceContext.Provider value={{ fetchPrice, clearCache }}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePrice = () => useContext(PriceContext);
