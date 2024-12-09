import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLivePrice } from "../hooks/useLivePrice";
import { useModal } from "../../context/ModalContext";
import TokenSelector from "../TokenSelector/TokenSelector";

const CreatePoolForm = ({
  tokenA,
  tokenB,
  amountA,
  amountB,
  setAmountA,
  setAmountB,
  setTokenA,
  setTokenB,
  handleCreatePool,
  existingPool,
  isLoadingPool,
  connection,
  tokens,
}) => {
  const { priceA, priceB, exchangeRate, lastUpdated, remainingTime } = useLivePrice(
    tokenA?.address,
    tokenB?.address
  );

  const { showModal, closeModal } = useModal();

  const [showWarning, setShowWarning] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceUnavailableMessage, setPriceUnavailableMessage] = useState("");

  useEffect(() => {
    if (!tokenA || !tokenB) {
      setShowWarning(false);
      setIsLoadingPrices(false);
      setPriceUnavailableMessage("");
      return;
    }

    if (priceA === null && priceB === null) {
      setIsLoadingPrices(false);
      setShowWarning(true);
      setPriceUnavailableMessage(
        `Prices are unavailable for both ${tokenA?.metadata?.symbol || tokenA?.symbol || "Token A"} and ${
          tokenB?.metadata?.symbol || tokenB?.symbol || "Token B"
        }. Ensure both tokens have valid prices before creating a pool.`
      );
    } else if (priceA === null || priceB === null) {
      setIsLoadingPrices(false);
      setShowWarning(true);
      setPriceUnavailableMessage(
        `Price unavailable for ${
          !priceA ? tokenA?.metadata?.symbol || tokenA?.symbol || "Token A" : ""
        } ${!priceA && !priceB ? "and" : ""} ${
          !priceB ? tokenB?.metadata?.symbol || tokenB?.symbol || "Token B" : ""
        }. Ensure both tokens have valid prices before creating a pool.`
      );
    } else {
      setIsLoadingPrices(false);
      setShowWarning(false);
      setPriceUnavailableMessage("");
    }
  }, [priceA, priceB, tokenA, tokenB]);

  const handleAmountAChange = (value) => {
    setAmountA(value);
    if (exchangeRate) {
      setAmountB((parseFloat(value) * exchangeRate).toFixed(6));
    }
  };

  const handleAmountBChange = (value) => {
    setAmountB(value);
    if (exchangeRate) {
      setAmountA((parseFloat(value) / exchangeRate).toFixed(6));
    }
  };

  const openTokenSelection = (target) => {
    showModal(
      "Select a Token",
      <TokenSelector
        onSelectToken={(selectedToken) => {
          if (target === "tokenA") {
            setTokenA(selectedToken);
          } else {
            setTokenB(selectedToken);
          }
          closeModal();
        }}
        onClose={closeModal}
        connection={connection}
        tokens={tokens}
      />,
      null,
      {
        showCloseButton: true,
        scrollableContent: true,
        modalWidth: "500px",
        backdropOpacity: 0.85,
        theme: "dark",
      }
    );
  };

  return (
    <div className="flex flex-col w-full md:max-w-md p-6 bg-gradient-to-b from-indigo-900 to-gray-900 rounded-xl shadow-lg border border-blue-900/50 backdrop-blur relative">
      <div className="mb-4">
        <label className="text-sm text-gray-300 mb-2 block">Choose the First Token</label>
        <button
          onClick={() => openTokenSelection("tokenA")}
          className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-between px-4 hover:brightness-110 transition"
        >
          {tokenA ? (
            <>
              <span>{tokenA.metadata?.symbol || tokenA.symbol}</span>
              <span className="text-sm text-gray-200">
                {`(${tokenA.address.slice(0, 4)}...${tokenA.address.slice(-4)})`}
              </span>
            </>
          ) : (
            "Select Token"
          )}
        </button>
      </div>

      <div className="mb-4">
        <label className="text-sm text-gray-300 mb-2 block">Choose the Second Token</label>
        <button
          onClick={() => openTokenSelection("tokenB")}
          className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-between px-4 hover:brightness-110 transition"
        >
          {tokenB ? (
            <>
              <span>{tokenB.metadata?.symbol || tokenB.symbol}</span>
              <span className="text-sm text-gray-200">
                {`(${tokenB.address.slice(0, 4)}...${tokenB.address.slice(-4)})`}
              </span>
            </>
          ) : (
            "Select Token"
          )}
        </button>
      </div>

      {!tokenA || !tokenB ? (
        <div className="p-4 bg-gray-800 rounded-lg border border-yellow-600 shadow-md">
          <p className="text-yellow-300 text-sm text-center font-bold">No tokens selected yet!</p>
          <p className="text-gray-300 text-xs text-center mt-2">
            Please select both Token A and Token B above to configure your liquidity pool. Once you've selected your tokens, you'll be able to set the amounts and create your pool.
          </p>
          <p className="text-gray-500 text-xs text-center mt-4 italic">
            Selecting tokens is the first step to establishing a successful liquidity pool.
          </p>
        </div>
      ) : (
        <div className="relative">
          {isLoadingPrices && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg z-10">
              <p className="text-white text-lg font-semibold">Loading...</p>
            </div>
          )}

          {showWarning && (
            <div className="absolute inset-0 bg-red-700/80 flex flex-col items-center justify-center rounded-lg z-10 p-4">
              <p className="text-white text-sm text-center font-bold">Warning: {priceUnavailableMessage}</p>
              <p className="text-gray-300 text-xs text-center mt-2">
                Please try again later or choose a different token pair to proceed.
              </p>
            </div>
          )}

          <div
            className={`p-4 bg-gray-800 rounded-lg border border-blue-700 shadow-md ${
              (isLoadingPrices || showWarning) ? "blur-sm pointer-events-none" : ""
            }`}
          >
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-300">Initial Price (1 Token A = X Token B)</label>
                <div className="flex items-center text-sm text-gray-400">
                  <div
                    className="h-4 w-4 border-2 border-blue-500 rounded-full flex justify-center items-center animate-spin"
                    style={{ animationDuration: `${5 - remainingTime}s` }}
                  />
                  <span className="ml-2">{remainingTime}s</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                This deal is quoted for {remainingTime} seconds. Last updated at {lastUpdated?.toLocaleTimeString() || "N/A"}.
              </p>
              <div className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg">
                {exchangeRate !== null ? (
                  `1 ${tokenA?.metadata?.symbol || tokenA.symbol} = ${exchangeRate.toFixed(6)} ${
                    tokenB?.metadata?.symbol || tokenB.symbol
                  }`
                ) : (
                  <span className="text-gray-500">Fetching price...</span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-300 mb-2 block">Enter Amount for the First Token</label>
              <input
                type="number"
                value={amountA}
                onChange={(e) => handleAmountAChange(e.target.value)}
                placeholder="E.g., 100.0"
                className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-300 mb-2 block">Enter Amount for the Second Token</label>
              <input
                type="number"
                value={amountB}
                onChange={(e) => handleAmountBChange(e.target.value)}
                placeholder="E.g., 200.0"
                className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              onClick={handleCreatePool}
              disabled={!!existingPool || isLoadingPool || showWarning}
              className={`w-full py-3 text-white font-bold rounded-lg transition ${
                isLoadingPool || showWarning
                  ? "bg-gradient-to-b from-gray-400 to-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-b from-blue-500 to-blue-700 hover:brightness-110"
              }`}
            >
              {isLoadingPool ? "Checking Pool..." : existingPool ? "Pool Exists" : "Create Pool"}
            </button>
          </div>
        </div>
      )}

      {existingPool && (
        <p className="mt-4 text-sm text-yellow-400 text-center">
          A pool for these tokens already exists. You can add liquidity instead.
        </p>
      )}
    </div>
  );
};

CreatePoolForm.propTypes = {
  tokenA: PropTypes.object,
  tokenB: PropTypes.object,
  amountA: PropTypes.string.isRequired,
  amountB: PropTypes.string.isRequired,
  setAmountA: PropTypes.func.isRequired,
  setAmountB: PropTypes.func.isRequired,
  setTokenA: PropTypes.func.isRequired,
  setTokenB: PropTypes.func.isRequired,
  handleCreatePool: PropTypes.func.isRequired,
  existingPool: PropTypes.object,
  isLoadingPool: PropTypes.bool.isRequired,
  connection: PropTypes.object.isRequired,
  tokens: PropTypes.array.isRequired,
};

export default CreatePoolForm;
