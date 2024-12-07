import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";

export const useTokenBalances = (walletPublicKey, connection, tokens) => {
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletPublicKey || !connection) {
      setBalances({});
      setLoading(false);
      return;
    }

    const fetchBalances = async () => {
      try {
        setLoading(true);
        const walletPubKey = new PublicKey(walletPublicKey);

        // Fetch token accounts owned by the wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubKey, {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        });

        const balanceMap = {};

        // Parse token account data and calculate balances
        tokenAccounts.value.forEach(({ account }) => {
          const { mint, tokenAmount } = account.data.parsed.info;
          const balance = Number(tokenAmount.amount) / Math.pow(10, tokenAmount.decimals);
          balanceMap[mint] = balance;
        });

        // Map balances to tokens in the list
        const matchedBalances = tokens.reduce((acc, token) => {
          acc[token.address] = balanceMap[token.address] || 0;
          return acc;
        }, {});

        setBalances(matchedBalances);
      } catch (error) {
        setBalances({});
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [walletPublicKey, connection, tokens]);

  return { balances, loading };
};
