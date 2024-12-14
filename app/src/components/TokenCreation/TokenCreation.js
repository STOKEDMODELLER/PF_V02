import React, { useState } from "react";
import TokenCreationForm from "./TokenCreationForm";
import { useTokenCreation } from "./hooks/useTokenCreation";
import { useLivePrice } from "../../components/hooks/useLivePrice";
import GlobalModal from "../Global/GlobalModal";

export default function TokenCreation() {
  const [tokenData, setTokenData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { isLoading, error, createToken } = useTokenCreation();
  const [creationError, setCreationError] = useState(null);
  const [isTokenCreated, setIsTokenCreated] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready to create your token!");

  const { priceA: solPrice, remainingTime } = useLivePrice(
    "So11111111111111111111111111111111111111112",
    "USDC"
  );

  const handlePreview = (data) => {
    setTokenData(data);
    setCreationError(null);
    setIsTokenCreated(false);
    setStatusMessage("Ready to create your token!");
    setIsModalVisible(true);
  };

  const handleCreateToken = async () => {
    if (!tokenData) {
      console.error("Token data is not provided. Aborting token creation.");
      return;
    }

    setCreationError(null);
    setStatusMessage("Starting token creation...");

    const created = await createToken(tokenData);

    if (!created) {
      console.error("Token creation failed. Error:", error);
      setCreationError(error);
      setStatusMessage("Token creation failed. Please try again.");
    } else {
      console.log("Token created successfully:", created);
      setTokenData(created);
      setIsTokenCreated(true);
      setStatusMessage("Token created successfully!");
    }
  };

  const handleCloseModal = () => {
    if (isLoading) return; // Prevent closing during loading
    setIsModalVisible(false);
    setTokenData(null);
    setCreationError(null);
    setIsTokenCreated(false);
    setStatusMessage("Ready to create your token!");
  };

  const networkFeeUSD = 1.27;
  const solEquivalent = solPrice ? (networkFeeUSD / solPrice).toFixed(5) : "Calculating...";

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-gradient-to-b from-indigo-900 to-gray-900 rounded-xl shadow-lg border border-blue-900/50 backdrop-blur p-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center mb-4">
          Bring Your Token to Life 🚀
        </h2>
        <p className="text-gray-300 text-sm sm:text-base text-center mb-6">
          Seamlessly create and deploy your token on Solana. Enter the details below to preview and deploy your token.
        </p>

        {error && !isModalVisible && (
          <div className="bg-red-500/30 text-red-100 p-3 rounded-md text-center mb-6">
            {typeof error === "object" ? (
              <ul>
                {Object.entries(error).map(([field, msg]) => (
                  <li key={field}>
                    {field}: {msg}
                  </li>
                ))}
              </ul>
            ) : (
              <span>{error}</span>
            )}
          </div>
        )}

        <TokenCreationForm onPreview={handlePreview} isLoading={isLoading} />

        <GlobalModal
          isVisible={isModalVisible}
          onClose={handleCloseModal}
          title={isTokenCreated ? "Token Created Successfully!" : "Token Creation Status"}
          content={
            <div className="flex flex-col h-auto max-h-screen overflow-auto gap-y-6">
              <div className="flex flex-col items-center text-center gap-y-3">
                <span className="text-lg font-medium">{statusMessage}</span>
                <img
                  className="h-28 w-28 sm:h-24 sm:w-24 rounded-full object-cover"
                  alt="preview"
                  src={tokenData?.image || "/placeholder.png"}
                />
                <span className="text-lg font-medium">{tokenData?.name || "N/A"}</span>
                <span className="text-gray-400">{tokenData?.symbol || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-y-4">
                <InfoRow label="Token Mint Address">
                  <button
                    className="bg-gray-700 text-white px-4 py-1 rounded-md text-sm font-medium hover:brightness-110"
                    onClick={() => {
                      navigator.clipboard.writeText(tokenData?.mintAddress || "N/A");
                      alert("Token address copied to clipboard!");
                    }}
                  >
                    {tokenData?.mintAddress
                      ? `${tokenData.mintAddress.slice(0, 8)}...${tokenData.mintAddress.slice(-4)}`
                      : "N/A"}
                  </button>
                </InfoRow>
                <InfoRow label="Supply" value={tokenData?.supply || "100,000,000"} />
                <InfoRow label="Network" value="Solana" />
                <InfoRow
                  label="Network Fee"
                  value={`$${networkFeeUSD.toFixed(2)} ≈ ${solEquivalent} SOL`}
                />
                <p className="text-xs text-gray-400">
                  *The SOL equivalent updates every 5 seconds. Confirm before proceeding. Expires in {remainingTime}s.
                </p>
              </div>
            </div>
          }
          footer={
            <button
              className={`w-full py-3 text-lg font-semibold rounded-md ${
                isLoading
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-b from-yellow-400 to-yellow-500 text-gray-900"
              }`}
              onClick={isLoading ? null : handleCreateToken}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : isTokenCreated ? "Done" : "Create Token"}
            </button>
          }
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value, children }) {
  return (
    <div className="flex justify-between items-center text-sm sm:text-base">
      <span className="text-gray-400">{label}</span>
      {value ? <span className="text-white">{value}</span> : children}
    </div>
  );
}
