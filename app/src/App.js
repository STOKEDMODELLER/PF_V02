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

// A well-known Solana RPC endpoint, replace with your production RPC if needed
const endpoint = process.env.REACT_APP_MAIN_RPC || "https://api.mainnet-beta.solana.com";

/**
 * Wrapper for TransactionHistory to ensure a connected wallet.
 */
const TransactionHistoryWrapper = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const walletAddress = publicKey?.toBase58();

    if (!walletAddress) {
        return <div className="text-white p-4">Please connect your wallet to view transaction history.</div>;
    }

    return <TransactionHistory walletAddress={walletAddress} connection={connection} />;
};

TransactionHistory.propTypes = {
    walletAddress: PropTypes.string.isRequired,
    connection: PropTypes.object.isRequired,
};

const App = () => {
    const wallets = [new PhantomWalletAdapter()];

    // State for the side panel
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    // Production-level tokens with real logos
    const [fromToken, setFromToken] = useState({
        symbol: "SOL",
        address: "So11111111111111111111111111111111111111112", // Native SOL placeholder
        image: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png"
    });

    const [toToken, setToToken] = useState({
        symbol: "USDC",
        address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Mainnet USDC
        image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU/logo.png"
    });

    const handleSwap = (fromAmount, fromToken, toToken, slippage) => {
        // Implement your swap logic here
        console.log("Swap initiated:", { fromAmount, fromToken, toToken, slippage });
        // Perform actual on-chain swap actions as needed
    };

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <NotificationProvider>
                    <ModalProvider>
                        <Router>
                            <div className="flex h-screen bg-black text-white">
                                <SidePanel isOpen={isSidePanelOpen} onClose={() => setIsSidePanelOpen(false)} />

                                <div className={`flex flex-col flex-grow transition-all duration-300 ${isSidePanelOpen ? "ml-72" : "ml-0"}`}>
                                    <Header toggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)} />
                                    <MobileNavBar toggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)} />

                                    <main className="p-4 flex flex-col items-center bg-pattern bg-cover bg-center gap-y-6 min-h-0 h-full overflow-auto">
                                        <Routes>
                                            <Route
                                                path="/"
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
                                            <Route path="/transaction-history" element={<TransactionHistoryWrapper />} />
                                        </Routes>
                                    </main>
                                </div>
                            </div>
                        </Router>
                    </ModalProvider>
                </NotificationProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default App;
