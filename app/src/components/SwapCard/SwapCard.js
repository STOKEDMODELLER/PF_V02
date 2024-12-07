import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import TokenSelector from "../TokenSelector/TokenSelector";
import AdvancedSettings from "../AdvancedSettings/AdvancedSettings";
import ConnectButton from "../ConnectButton";
import GlobalModal from "../Global/GlobalModal";

const SwapCard = ({ onSwap }) => {
  const { connected } = useWallet();
  const [tokens, setTokens] = useState([]);
  const [connection] = useState(() => new Connection("https://api.devnet.solana.com"));
  const [fromToken, setFromToken] = useState({ symbol: "SOL", image: "https://via.placeholder.com/40" });
  const [toToken, setToToken] = useState({ symbol: "USDC", image: "https://via.placeholder.com/40" });
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [isSlippageOpen, setIsSlippageOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch("tokens_dummy_data.json"); // Replace with actual token list API
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

  const handleSwap = () => {
    if (!fromAmount || !fromToken || !toToken) {
      alert("Please enter a valid amount and select tokens.");
      return;
    }
    onSwap(fromAmount, fromToken.symbol, toToken.symbol, slippage);
  };

  const handleTokenSelect = (token) => {
    const tokenData = { symbol: token.metadata?.symbol || token.symbol, image: token.metadata?.image || "https://via.placeholder.com/40" };
    if (isTokenSelectorOpen === "from") setFromToken(tokenData);
    if (isTokenSelectorOpen === "to") setToToken(tokenData);
    setIsTokenSelectorOpen(false);
    setIsModalVisible(false);
  };

  const handleSlippageChange = (value) => {
    setSlippage(value);
    setIsSlippageOpen(false);
    setIsModalVisible(false);
  };

  const openTokenSelector = (type) => {
    setIsTokenSelectorOpen(type);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsTokenSelectorOpen(false);
    setIsSlippageOpen(false);
    setIsModalVisible(false);
  };

  const openSlippageModal = () => {
    setIsSlippageOpen(true);
    setIsModalVisible(true);
  };

  return (
    <>
      <div className="flex flex-col w-full md:max-w-md p-6 bg-gradient-to-b from-indigo-900 to-gray-900 rounded-xl shadow-lg border border-blue-900/50 backdrop-blur">
        <div className="flex justify-between items-center text-gray-200 mb-4">
          <h3 className="text-sm font-semibold text-white">Slippage: {slippage}%</h3>
          <button className="p-2 rounded-full hover:bg-indigo-800/70 transition" aria-label="Settings" onClick={openSlippageModal}>
            <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative flex items-center justify-between p-4 bg-indigo-800 rounded-lg border border-transparent focus-within:border-blue-400">
            <div className="flex flex-col w-[65%]">
              <label className="text-sm text-white">Pay</label>
              <input type="text" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} placeholder="0.0" className="bg-transparent text-white text-2xl font-semibold focus:outline-none" />
              <span className="text-sm text-white">$0.00</span>
            </div>
            <button className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-medium flex items-center gap-2" onClick={() => openTokenSelector("from")}>
              <img src={fromToken.image} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
              {fromToken.symbol}
            </button>
          </div>

          <button
            className="mx-auto p-2 bg-blue-600 rounded-full text-white shadow-lg hover:scale-110 transition z-10"
            onClick={() => {
              const temp = fromToken;
              setFromToken(toToken);
              setToToken(temp);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 28 24" className="h-6 w-6">
              <path fill="currentColor" d="M18.347 18.384q.32 0 .535-.216a.73.73 0 0 0 .215-.534V8.103l2.317 2.317a.68.68 0 0 0 .508.208.767.767 0 0 0 .77-.752.74.74 0 0 0-.233-.535l-3.47-3.469a.8.8 0 0 0-.297-.198 1 1 0 0 0-.678 0 .8.8 0 0 0-.3.198L14.22 9.366a.7.7 0 0 0-.22.518q.003.294.236.528.232.216.526.223a.7.7 0 0 0 .527-.225l2.308-2.307v9.54q0 .315.216.528a.73.73 0 0 0 .534.213m-8.702 0a1 1 0 0 0 .34-.059.8.8 0 0 0 .3-.197l3.495-3.495a.7.7 0 0 0 .22-.517.74.74 0 0 0-.236-.529.8.8 0 0 0-.527-.223.7.7 0 0 0-.527.225l-2.307 2.308v-9.54a.731.731 0 0 0-.75-.74.73.73 0 0 0-.535.215.73.73 0 0 0-.215.534v9.531L6.585 13.58a.68.68 0 0 0-.507-.208.767.767 0 0 0-.77.752q0 .302.233.534l3.47 3.47q.14.14.297.198a1 1 0 0 0 .337.058" />
            </svg>
          </button>

          <div className="relative flex items-center justify-between p-4 bg-indigo-800 rounded-lg border border-transparent focus-within:border-blue-400">
            <div className="flex flex-col w-[65%]">
              <label className="text-sm text-white">Receive</label>
              <input type="text" value={toAmount} onChange={(e) => setToAmount(e.target.value)} placeholder="0.0" className="bg-transparent text-white text-2xl font-semibold focus:outline-none" />
              <span className="text-sm text-white">$0.00</span>
            </div>
            <button className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-medium flex items-center gap-2" onClick={() => openTokenSelector("to")}>
              <img src={toToken.image} alt={toToken.symbol} className="w-6 h-6 rounded-full" />
              {toToken.symbol}
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center items-center mt-6">
          {connected ? (
            <button onClick={handleSwap} className="w-full py-3 bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold rounded-lg hover:brightness-110 transition">
              Swap Now
            </button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>

      {isModalVisible && (
        <GlobalModal
          isVisible={isModalVisible}
          title={isTokenSelectorOpen ? "Select a Token" : isSlippageOpen ? "Advanced Settings" : ""}
          content={
            isTokenSelectorOpen ? (
              <TokenSelector onSelectToken={handleTokenSelect} onClose={closeModal} connection={connection} tokens={tokens} />
            ) : isSlippageOpen ? (
              <AdvancedSettings slippage={slippage} onUpdateSlippage={handleSlippageChange} isOpen={isSlippageOpen} onClose={closeModal} />
            ) : null
          }
          onClose={closeModal}
          options={{
            fixedHeader: true,
            scrollableContent: !!isTokenSelectorOpen,
            modalWidth: "500px",
            modalHeight: isSlippageOpen ? "auto" : "70%",
            showCloseButton: true,
            theme: "dark",
          }}
        />
      )}
    </>
  );
};

SwapCard.propTypes = {
  onSwap: PropTypes.func.isRequired,
};

export default SwapCard;
