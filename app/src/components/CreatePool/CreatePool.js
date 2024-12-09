import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { createPoolIfNotExists } from "../../utils/poolInteraction";
import { useNotification } from "../../context/NotificationContext";
import CreatePoolForm from "./CreatePoolForm";
import PoolInfoCard from "./PoolInfoCard";
import GlobalModal from "../Global/GlobalModal";
import TokenSelector from "../TokenSelector/TokenSelector";
import { checkPoolExists } from '../../utils/poolInteraction';

const CreatePool = () => {
  const wallet = useWallet();
  const { connected } = wallet;
  const { showNotification } = useNotification();

  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [existingPool, setExistingPool] = useState(null);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [connection] = useState(() => new Connection("https://api.devnet.solana.com"));

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch("tokens_dummy_data.json");
        const data = await response.json();
        if (Array.isArray(data.data)) {
          setTokens(data.data);
        } else {
          console.error("Invalid token data format.");
        }
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
      }
    };
    fetchTokens();
  }, []);

  useEffect(() => {
    const fetchPoolInfo = async () => {
      if (!tokenA || !tokenB || !connected) return;
      setIsLoadingPool(true);
      const { pda, exists } = await checkPoolExists(tokenA.address, tokenB.address);
      setExistingPool(exists ? { address: pda.toBase58() } : null);
      setIsLoadingPool(false);
    };

    fetchPoolInfo();
  }, [tokenA, tokenB, connected]);

  const handleCreatePool = async () => {
    if (!connected || !wallet.publicKey || !wallet.signTransaction) {
      showNotification("Connect your wallet to create a liquidity pool.", "error");
      return;
    }

    if (!tokenA || !tokenB || !amountA || !amountB) {
      showNotification("Please fill in all required fields.", "error");
      return;
    }

    if (tokenA.address === tokenB.address) {
      showNotification("Token A and Token B must be different.", "error");
      return;
    }

    if (existingPool) {
      showNotification("A liquidity pool for this token pair already exists.", "error");
      return;
    }

    try {
      const txId = await createPoolIfNotExists(
        tokenA.address,
        tokenB.address,
        parseFloat(amountA),
        parseFloat(amountB),
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction.bind(wallet),
          signAllTransactions: wallet.signAllTransactions
            ? wallet.signAllTransactions.bind(wallet)
            : async (txs) => txs,
        }
      );
      if (txId) {
        showNotification(`Your pool was created successfully! Transaction ID: ${txId}`, "success");
        resetForm();
      }
    } catch (error) {
      console.error("Error creating pool:", error);
      showNotification(`Error creating pool: ${error.message}`, "error");
    }
  };

  const resetForm = () => {
    setTokenA(null);
    setTokenB(null);
    setAmountA("");
    setAmountB("");
    setExistingPool(null);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gradient-to-b from-indigo-900 to-gray-900 rounded-xl shadow-lg border border-blue-900/50 backdrop-blur">
      <h2 className="text-3xl font-semibold text-white mb-6 text-center">
        Launch Your Liquidity Pool
      </h2>
      <p className="text-gray-300 text-sm text-center mb-6">
        Seamlessly pair your tokens and make them tradable. Enter the token details below to kickstart your liquidity pool in seconds.
      </p>

      <CreatePoolForm
        tokenA={tokenA}
        tokenB={tokenB}
        amountA={amountA}
        amountB={amountB}
        setTokenA={setTokenA}
        setTokenB={setTokenB}
        setAmountA={setAmountA}
        setAmountB={setAmountB}
        openTokenSelector={(type) => {
          setIsTokenSelectorOpen(type);
          setIsModalVisible(true);
        }}
        handleCreatePool={handleCreatePool}
        existingPool={existingPool}
        isLoadingPool={isLoadingPool}
      />

      {isModalVisible && (
        <GlobalModal
          isVisible={isModalVisible}
          title="Choose a Token"
          content={
            <TokenSelector
              onSelectToken={(token) => {
                if (isTokenSelectorOpen === "tokenA") setTokenA(token);
                if (isTokenSelectorOpen === "tokenB") setTokenB(token);
                setIsModalVisible(false);
              }}
              onClose={() => setIsModalVisible(false)}
              connection={connection}
              tokens={tokens}
            />
          }
          onClose={() => setIsModalVisible(false)}
        />
      )}

      {existingPool && (
        <div className="mt-6">
          <PoolInfoCard pool={existingPool} tokenAInfo={tokenA} tokenBInfo={tokenB} />
        </div>
      )}
    </div>
  );
};

export default CreatePool;
