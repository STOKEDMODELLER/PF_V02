import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SwapComponent from "./components/SwapComponent";
import { ThemeProvider } from "./context/ThemeContext";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

function App() {
  const endpoint = clusterApiUrl("mainnet-beta");
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ThemeProvider>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
              <Header />
              <SwapComponent />
              <Footer />
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}

export default App;
