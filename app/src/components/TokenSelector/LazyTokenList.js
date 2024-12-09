import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import TokenRow from "./TokenRow";

const PAGE_SIZE = 20;
const RPC_URL = process.env.REACT_APP_MAIN_RPC;

const LazyTokenList = ({ onSelectToken, searchTerm }) => {
  const { connected, publicKey } = useWallet();
  const [connection] = useState(() => new Connection(RPC_URL));
  const [tokens, setTokens] = useState([]);
  const [displayedTokens, setDisplayedTokens] = useState([]);
  const [balances, setBalances] = useState({});
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch balances for tokens
  const fetchBalances = useCallback(async () => {
    if (!connected || !publicKey) {
      console.log("Missing walletPublicKey or connection instance.");
      return;
    }

    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const updatedBalances = {};
      tokenAccounts.value.forEach(({ account }) => {
        const { mint, tokenAmount } = account.data.parsed.info;
        updatedBalances[mint] = tokenAmount.uiAmount || 0;

      });

      setBalances(updatedBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  }, [connected, publicKey, connection]);

  // Fetch tokens (dummy data)
  const loadTokens = async () => {
    try {
      const response = await fetch("tokens_dummy_data.json");
      const data = await response.json();
      if (Array.isArray(data.data)) {
        setTokens(data.data);
        setDisplayedTokens(data.data.slice(0, PAGE_SIZE));
        setPage(1);
        setHasMore(data.data.length > PAGE_SIZE);
      } else {
        setTokens([]);
        setDisplayedTokens([]);
        setHasMore(false);
      }
    } catch (error) {
    }
  };

  const loadMoreTokens = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      const start = page * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const nextBatch = tokens.slice(start, end);
      if (nextBatch.length > 0) {
        setDisplayedTokens((prev) => [...prev, ...nextBatch]);
        setPage((prev) => prev + 1);
        setHasMore(tokens.length > end);
      } else {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadTokens();
    if (connected) fetchBalances();
  }, [connected, fetchBalances]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById("token-list-container");
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !isLoading) {
          loadMoreTokens();
        }
      }
    };

    const container = document.getElementById("token-list-container");
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (tokens.length > 0) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const filtered = tokens.filter((token) => {
        return (
          token.metadata?.symbol?.toLowerCase().includes(lowerCaseSearch) ||
          token.metadata?.name?.toLowerCase().includes(lowerCaseSearch) ||
          token.address?.toLowerCase().includes(lowerCaseSearch)
        );
      }).slice(0, PAGE_SIZE * page);

      setDisplayedTokens(filtered);
      setHasMore(filtered.length < tokens.length);
    }
  }, [tokens, searchTerm, page]);

  return (
    <div id="token-list-container" className="overflow-y-auto h-full">
      <ul className="divide-y divide-gray-700">
        {displayedTokens.map((token) => (
          <TokenRow
            key={token.address}
            token={token}
            onSelect={onSelectToken}
            balance={balances[token.address] || 0} // Use mint address for balances
          />
        ))}
      </ul>
      {isLoading && (
        <div className="text-center mt-4 text-gray-400 text-sm">Loading...</div>
      )}
      {!hasMore && !isLoading && (
        <div className="text-center mt-4 text-gray-400 text-sm">No more tokens to load.</div>
      )}
    </div>
  );
};

LazyTokenList.propTypes = {
  onSelectToken: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
};

export default LazyTokenList;
