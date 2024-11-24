import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletSelectorModal from "./WalletSelector";
import styles from "../styles/Header.module.css";

const Header = () => {
  const { theme } = useTheme(); // Access theme from context
  const { connected, publicKey, disconnect } = useWallet(); // Wallet connection status and methods
  const [isModalOpen, setIsModalOpen] = useState(false); // State to handle wallet selector modal
  const [menuOpen, setMenuOpen] = useState(false); // State to toggle dropdown menu

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  return (
    <header className={styles.header}>
      {/* Logo */}
      <h1 className={styles.logo}>DeFi Platform</h1>

      {/* Hamburger Menu */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle Menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Dropdown Menu */}
      <nav className={`${styles.menu} ${menuOpen ? styles.menuOpen : ""}`}>
        {connected ? (
          <>
            <button
              className={`${styles.button} ${styles.disconnectButton}`}
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
            <span className={styles.walletAddress}>
              {publicKey?.toBase58().slice(0, 6)}...
              {publicKey?.toBase58().slice(-6)}
            </span>
          </>
        ) : (
          <button
            className={`${styles.button} ${styles.connectButton}`}
            onClick={() => setIsModalOpen(true)}
          >
            Connect Wallet
          </button>
        )}
      </nav>

      {/* Wallet Selector Modal */}
      {isModalOpen && <WalletSelectorModal onClose={() => setIsModalOpen(false)} />}
    </header>
  );
};

export default Header;
