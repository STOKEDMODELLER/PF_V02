import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  WalletProvider,
  ConnectionProvider,
  useWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import PropTypes from "prop-types";

import MobileNavBar from "./components/MobileNavBar";
import Header from "./components/Header";
import SidePanel from "./components/SidePanel/SidePanel";
import SwapCard from "./components/SwapCard";
import PoolsPage from "./components/Pools/PoolsPage";
import TransactionHistory from "./components/TransactionHistory/TransactionHistory";
import CreatePool from "./components/CreatePool/CreatePool";
import { NotificationProvider } from "./context/NotificationContext";
import { ModalProvider } from "./context/ModalContext";
import PlatformInfo from "./components/ProgramControl/PlatformInfo";
import TokenCreation from "./components/TokenCreation/TokenCreation";

const endpoint = process.env.REACT_APP_MAIN_RPC || "https://api.mainnet-beta.solana.com";

const TransactionHistoryWrapper = React.memo(({ walletAddress, connection }) => {
  if (!walletAddress) {
    return <div className="text-white p-4">Please connect your wallet to view transaction history.</div>;
  }

  return <TransactionHistory walletAddress={walletAddress} connection={connection} />;
});

TransactionHistoryWrapper.propTypes = {
  walletAddress: PropTypes.string.isRequired,
  connection: PropTypes.object.isRequired,
};


const AppLayout = React.memo(({ children }) => (
  <div className="flex flex-col h-screen text-white">
    {/* Header */}
    <Header />
    <MobileNavBar />
    {/* Main Content Wrapper */}
    <div className="flex flex-col flex-grow overflow-auto pt-16">
      <main className="px-4 pb-16 pt-4 flex flex-col items-center bg-pattern bg-cover bg-center gap-y-6">
        {children}
      </main>
    </div>

  </div>
));

const App = () => {
  const wallets = [new PhantomWalletAdapter()];
  const [fromToken, setFromToken] = useState({
    symbol: "SOL",
    address: "So11111111111111111111111111111111111111112",
    image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
  });

  const [toToken, setToToken] = useState({
    symbol: "USDC",
    address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU/logo.png",
  });

  const handleSwap = (fromAmount, fromToken, toToken, slippage) => {
    console.log("Swap initiated:", { fromAmount, fromToken, toToken, slippage });
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <NotificationProvider>
          <ModalProvider>
            <Router>
              <AppLayout>
                <Routes>
                  <Route
                    path="/home"
                    element={
                      <SwapCard
                        onSwap={handleSwap}
                        fromToken={fromToken}
                        setFromToken={setFromToken}
                        toToken={toToken}
                        setToToken={setToToken}
                      />
                    }
                  />
                  <Route path="/pools" element={<PoolsPage />} />
                  <Route path="/create-pool" element={<CreatePool />} />
                  <Route
                    path="/transaction-history"
                    element={
                      <TransactionHistoryWrapper
                        walletAddress={useWallet().publicKey?.toBase58()}
                        connection={useConnection().connection}
                      />
                    }
                  />
                  <Route path="/PlatformInfo" element={<PlatformInfo />} />
                  <Route path="/TokenCreation" element={<TokenCreation />} />
                </Routes>
              </AppLayout>
            </Router>
          </ModalProvider>
        </NotificationProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
