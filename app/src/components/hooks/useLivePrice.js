import { useState, useEffect, useCallback } from "react";

export const useLivePrice = (tokenAAddress, tokenBAddress) => {
  const [priceA, setPriceA] = useState(null);
  const [priceB, setPriceB] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [remainingTime, setRemainingTime] = useState(5);

  // Fetch prices for tokens
  const fetchPrices = useCallback(async () => {
    if (!tokenAAddress || !tokenBAddress) return;

    try {
      const response = await fetch(
        `https://api.jup.ag/price/v2?ids=${tokenAAddress},${tokenBAddress}`
      );
      const data = await response.json();

      const tokenAPrice = data?.data[tokenAAddress]?.price || null;
      const tokenBPrice = data?.data[tokenBAddress]?.price || null;

      setPriceA(tokenAPrice ? parseFloat(tokenAPrice) : null);
      setPriceB(tokenBPrice ? parseFloat(tokenBPrice) : null);

      if (tokenAPrice && tokenBPrice) {
        setExchangeRate(parseFloat(tokenAPrice) / parseFloat(tokenBPrice));
      } else {
        setExchangeRate(null); // Exchange rate invalid if any price is missing
      }

      setLastUpdated(new Date());
      setRemainingTime(5); // Reset timer
    } catch (error) {
      console.error("Error fetching prices:", error);
      setPriceA(null);
      setPriceB(null);
      setExchangeRate(null);
    }
  }, [tokenAAddress, tokenBAddress]);

  // Timer to refresh prices every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          fetchPrices(); // Refresh prices when timer reaches 0
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchPrices]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return {
    priceA,
    priceB,
    exchangeRate,
    lastUpdated,
    remainingTime,
    refreshPrice: fetchPrices,
  };
};
