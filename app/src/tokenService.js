// src/tokenService.js

import axios from "axios";

let tokenList = [];

export const fetchTokenList = async () => {
  if (tokenList.length > 0) {
    // Token list already fetched
    return tokenList;
  }

  try {
    const response = await axios.get(
      "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json"
    );
    tokenList = response.data.tokens.map((token) => ({
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      logoURI: token.logoURI,
    }));
  } catch (error) {
    console.error("Error fetching token list:", error);
  }

  return tokenList;
};

export const searchTokens = async (searchTerm) => {
  if (tokenList.length === 0) {
    await fetchTokenList();
  }

  const lowercasedTerm = searchTerm.toLowerCase();

  return tokenList.filter(
    (token) =>
      token.symbol.toLowerCase().includes(lowercasedTerm) ||
      token.name.toLowerCase().includes(lowercasedTerm) ||
      token.address.toLowerCase().includes(lowercasedTerm)
  );
};
