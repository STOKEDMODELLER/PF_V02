// src/App.js

import React, { useState, useEffect } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@project-serum/anchor";
import idl from "./idl.json";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { notification } from "antd";
import axios from "axios";
import TokenSelectionModal from "./TokenSelectionModal";
import "./App.css"; // Import custom styles
import "antd/dist/reset.css";
import { fetchTokenList } from "./tokenService"; // Import token service

// Constants
const programId = new PublicKey(
  "8oQFwDXMMW1Chuu5vmQHAfYfxXBYYLtW5rxGVGxUmMSj"
);
const network = clusterApiUrl("devnet");

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [program, setProgram] = useState(null);
  const [inputAmount, setInputAmount] = useState("");
  const [minimumOutputAmount, setMinimumOutputAmount] = useState("");
  const [tokenAAddress, setTokenAAddress] = useState("");
  const [tokenBAddress, setTokenBAddress] = useState("");
  const [poolAccountPublicKey, setPoolAccountPublicKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selectedTokenField, setSelectedTokenField] = useState(null); // "input" or "output"

  // Connect Phantom Wallet
  const connectWallet = async () => {
    if (window.solana?.isPhantom) {
      try {
        const response = await window.solana.connect({
          onlyIfTrusted: false,
        });
        if (!response?.publicKey) {
          throw new Error("No public key found in response.");
        }
        setWalletAddress(response.publicKey.toString());
        console.log("Wallet Connected:", response.publicKey.toString());
      } catch (err) {
        console.error("Error connecting to wallet:", err);
        notification.error({
          message: "Wallet Connection Failed",
          description: err.message || "An unexpected error occurred.",
        });
      }
    } else {
      notification.warning({
        message: "Phantom Wallet Not Found",
        description: "Please install the Phantom Wallet extension.",
      });
    }
  };

  // Initialize the Program
  const initializeProgram = async () => {
    try {
      const connection = new Connection(network, "processed");
      const provider = new AnchorProvider(connection, window.solana, {
        preflightCommitment: "processed",
      });

      console.log("Provider:", provider);
      console.log("IDL:", idl);

      const program = new Program(idl, programId, provider);
      console.log("Program Initialized:", program);

      setProgram(program);
    } catch (err) {
      console.error("Error Initializing Program:", err);
      notification.error({
        message: "Program Initialization Failed",
        description: err.message || "An unknown error occurred.",
      });
    }
  };

  // Execute the Swap
  const executeSwap = async () => {
    if (!program) {
      notification.warning({
        message: "Program Not Initialized",
        description: "Please connect your wallet.",
      });
      return;
    }

    if (
      !walletAddress ||
      !inputAmount ||
      !minimumOutputAmount ||
      !tokenAAddress ||
      !tokenBAddress ||
      !poolAccountPublicKey
    ) {
      notification.warning({
        message: "Missing Information",
        description: "Ensure all fields are filled and wallet is connected.",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Executing Swap with:");
      console.log("Input Amount:", inputAmount);
      console.log("Minimum Output:", minimumOutputAmount);
      console.log("Token A Address:", tokenAAddress);
      console.log("Token B Address:", tokenBAddress);

      const userPublicKey = new PublicKey(walletAddress);
      const tokenAMint = new PublicKey(tokenAAddress);
      const tokenBMint = new PublicKey(tokenBAddress);
      const poolPublicKey = new PublicKey(poolAccountPublicKey);

      // Fetch user's associated token accounts
      const userTokenAAccount = await findAssociatedTokenAddress(
        userPublicKey,
        tokenAMint
      );
      const userTokenBAccount = await findAssociatedTokenAddress(
        userPublicKey,
        tokenBMint
      );

      // Fetch pool's token accounts (should be stored or known)
      const poolTokenAAccount = await findAssociatedTokenAddress(
        poolPublicKey,
        tokenAMint
      );
      const poolTokenBAccount = await findAssociatedTokenAddress(
        poolPublicKey,
        tokenBMint
      );

      const tx = await program.rpc.swap(
        new BN(inputAmount),
        new BN(minimumOutputAmount),
        {
          accounts: {
            pool: poolPublicKey,
            poolTokenA: poolTokenAAccount,
            poolTokenB: poolTokenBAccount,
            userTokenA: userTokenAAccount,
            userTokenB: userTokenBAccount,
            user: userPublicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
        }
      );

      notification.success({
        message: "Swap Successful",
        description: `Transaction Signature: ${tx}`,
      });
    } catch (err) {
      console.error("Swap Failed:", err);
      notification.error({
        message: "Swap Failed",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to find associated token address
  const findAssociatedTokenAddress = async (walletAddress, tokenMintAddress) => {
    return (
      await PublicKey.findProgramAddress(
        [
          walletAddress.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintAddress.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];
  };

  // Fetch Top 10 Tokens
  useEffect(() => {
    const fetchTopTokens = async () => {
      try {
        // Fetch top 10 tokens by volume from CoinGecko
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "volume_desc",
              per_page: 50,
              page: 1,
              sparkline: false,
            },
          }
        );

        const coinGeckoTokens = response.data;

        // Fetch Solana Token List (only once)
        const solanaTokens = await fetchTokenList();

        // Map CoinGecko tokens to Solana tokens
        const topTokens = [];

        for (const cgToken of coinGeckoTokens) {
          // Find matching token in Solana token list
          const matchingToken = solanaTokens.find(
            (token) =>
              token.symbol.toLowerCase() === cgToken.symbol.toLowerCase() ||
              token.name.toLowerCase() === cgToken.name.toLowerCase()
          );

          if (matchingToken) {
            topTokens.push(matchingToken);

            if (topTokens.length >= 10) {
              break; // We have our top 10 tokens
            }
          }
        }

        setTokens(topTokens);
      } catch (error) {
        console.error("Error fetching top tokens:", error);
      }
    };

    fetchTopTokens();
  }, []);

  // Initialize Program when wallet is connected
  useEffect(() => {
    if (walletAddress) initializeProgram();
  }, [walletAddress]);

  // Handle Token Selection
  const handleSelectToken = (token) => {
    if (selectedTokenField === "input") {
      setTokenAAddress(token.address);
    } else if (selectedTokenField === "output") {
      setTokenBAddress(token.address);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0e1129] to-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#141852]">
        <div className="flex items-center">
          {/* Logo and Name */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 81 15"
            className="h-6 w-auto"
          >
            {/* Include your logo SVG paths here */}
            <text
              x="0"
              y="12"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
            >
              StellarSwap
            </text>
          </svg>
          <span className="ml-3 text-xl font-bold">Trade Among the Stars</span>
        </div>
        <div>
          {/* Wallet Connection */}
          {!walletAddress ? (
            <button
              className="px-4 py-2 bg-blue-600 rounded-md"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center">
              <span className="mr-3">
                Connected: {walletAddress.slice(0, 6)}...
                {walletAddress.slice(-4)}
              </span>
              <img
                className="h-8 w-8 rounded-full"
                src="https://raw.githubusercontent.com/solana-labs/oyster/main/assets/phantom.png"
                alt="Phantom"
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center mt-10 px-4">
        <div className="w-full max-w-md p-6 bg-[#1e223a] rounded-xl shadow-md">
          {/* Swap Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Swap</h2>
          </div>

          {/* Swap Inputs */}
          <div className="space-y-4">
            {/* Pay Section */}
            <div className="p-4 bg-[#2d3150] rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Pay</label>
                <button
                  className="flex items-center space-x-2 bg-[#1f2244] px-3 py-1 rounded-full"
                  onClick={() => {
                    setSelectedTokenField("input");
                    setIsTokenModalOpen(true);
                  }}
                >
                  {tokenAAddress ? (
                    <>
                      <img
                        src={
                          tokens.find((t) => t.address === tokenAAddress)
                            ?.logoURI || "/default_image.png"
                        }
                        alt="Token"
                        className="h-5 w-5 rounded-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default_image.png";
                        }}
                      />
                      <span>
                        {tokens.find((t) => t.address === tokenAAddress)?.symbol}
                      </span>
                    </>
                  ) : (
                    <span>Select Token</span>
                  )}
                  <svg
                    className="h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.204 5h9.592L8 10.796 3.204 5z"></path>
                  </svg>
                </button>
              </div>
              <input
                className="w-full mt-2 bg-transparent text-2xl font-semibold focus:outline-none"
                placeholder="0.0"
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
              />
            </div>

            {/* Swap Icon */}
            <div className="flex justify-center">
              <button
                className="p-2 bg-[#1f2244] rounded-full"
                onClick={() => {
                  // Swap tokens
                  const tempAddress = tokenAAddress;
                  setTokenAAddress(tokenBAddress);
                  setTokenBAddress(tempAddress);
                  const tempAmount = inputAmount;
                  setInputAmount(minimumOutputAmount);
                  setMinimumOutputAmount(tempAmount);
                }}
              >
                <svg
                  className="h-6 w-6 text-gray-400 transform rotate-90"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 .34-.03.67-.08 1H19c.05-.33.08-.66.08-1 0-3.87-3.13-7-7-7zM6 13c-.05.33-.08.66-.08 1 0 3.87 3.13 7 7 7v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-.34.03-.67.08-1H6z"></path>
                </svg>
              </button>
            </div>

            {/* Receive Section */}
            <div className="p-4 bg-[#2d3150] rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Receive</label>
                <button
                  className="flex items-center space-x-2 bg-[#1f2244] px-3 py-1 rounded-full"
                  onClick={() => {
                    setSelectedTokenField("output");
                    setIsTokenModalOpen(true);
                  }}
                >
                  {tokenBAddress ? (
                    <>
                      <img
                        src={
                          tokens.find((t) => t.address === tokenBAddress)
                            ?.logoURI || "/default_image.png"
                        }
                        alt="Token"
                        className="h-5 w-5 rounded-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default_image.png";
                        }}
                      />
                      <span>
                        {tokens.find((t) => t.address === tokenBAddress)?.symbol}
                      </span>
                    </>
                  ) : (
                    <span>Select Token</span>
                  )}
                  <svg
                    className="h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.204 5h9.592L8 10.796 3.204 5z"></path>
                  </svg>
                </button>
              </div>
              <input
                className="w-full mt-2 bg-transparent text-2xl font-semibold focus:outline-none"
                placeholder="0.0"
                type="number"
                value={minimumOutputAmount}
                onChange={(e) => setMinimumOutputAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Pool Account Public Key Input */}
          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-1">
              Pool Account Public Key
            </label>
            <input
              className="w-full p-2 bg-[#2d3150] rounded focus:outline-none"
              placeholder="Enter Pool Account Public Key"
              value={poolAccountPublicKey}
              onChange={(e) => setPoolAccountPublicKey(e.target.value)}
            />
          </div>

          {/* Swap Button */}
          <button
            className="w-full mt-6 py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
            onClick={executeSwap}
            disabled={loading}
          >
            {loading ? "Swapping..." : "Swap"}
          </button>
        </div>
      </main>

      {/* TokenSelectionModal */}
      {isTokenModalOpen && (
        <TokenSelectionModal
          tokens={tokens}
          onSelectToken={handleSelectToken}
          onClose={() => setIsTokenModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
