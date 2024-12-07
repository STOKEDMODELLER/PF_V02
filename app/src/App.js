// ./App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WalletConnectionProvider from "./components/WalletProvider";
import Header from "./components/Header";
import MobileNavBar from "./components/MobileNavBar";
import SwapCard from "./components/SwapCard";
import LiquidityInfo from "./components/LiquidityInfo/LiquidityInfo";
import PoolsPage from "./components/Pools/PoolsPage";
import TransactionHistory from "./components/TransactionHistory/TransactionHistory";
import CreatePool from "./components/CreatePool/CreatePool";
import { NotificationProvider } from "./context/NotificationContext";
import { Connection } from "@solana/web3.js";

const App = () => {
    const connection = new Connection("https://api.mainnet-beta.solana.com");
    const walletAddress = "99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR"; // Replace dynamically or fetch from a wallet provider

    // Define swap functionality
    const handleSwap = (fromAmount, fromToken, toToken, slippage) => {
        console.log("Swap initiated:", { fromAmount, fromToken, toToken, slippage });
        // Add swap transaction processing logic here
    };

    return (
        <WalletConnectionProvider>
            <NotificationProvider>
                <Router>
                    <div className="App">
                        <Header />
                        <MobileNavBar />
                        <main className="p-4 flex flex-col items-center bg-pattern bg-cover bg-center gap-y-6">
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <>
                                            <SwapCard onSwap={handleSwap} />
                                            <LiquidityInfo
                                                poolAddress="YourPoolAddressHere" // Replace with dynamic pool address
                                                connection={connection}
                                                onCreateLiquidity={() =>
                                                    console.log("Create Liquidity action triggered")
                                                }
                                            />
                                        </>
                                    }
                                />
                                <Route
                                    path="/pools"
                                    element={<PoolsPage connection={connection} />}
                                />
                                <Route path="/create-pool" element={<CreatePool />} />
                                <Route
                                    path="/transaction-history"
                                    element={
                                        <TransactionHistory
                                            walletAddress={walletAddress}
                                            connection={connection}
                                        />
                                    }
                                />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </NotificationProvider>
        </WalletConnectionProvider>
    );
};

export default App;
