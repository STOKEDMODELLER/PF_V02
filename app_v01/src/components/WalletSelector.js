import React from "react";
import {
  WalletModalProvider,
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import styles from "../styles/WalletSelectorModal.module.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const WalletSelectorModal = ({ onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Modal Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Connect Your Wallet</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Wallet Actions */}
        <div className={styles.walletActions}>
          <WalletModalProvider>
            <WalletMultiButton className={styles.walletButton} />
            <WalletDisconnectButton className={styles.disconnectButton} />
          </WalletModalProvider>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>New to crypto wallets?</p>
          <a
            href="https://phantom.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.learnMore}
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
};

export default WalletSelectorModal;
