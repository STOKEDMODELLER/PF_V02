import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import default styles for Wallet Adapter
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletConnectionProvider = ({ children }) => {
    // Determine the network (default to Devnet if not provided)
    const network = useMemo(
        () =>
            process.env.REACT_APP_SOLANA_NETWORK ||
            WalletAdapterNetwork.Devnet,
        []
    );

    // Use a cluster API URL for the selected network
    const endpoint = useMemo(
        () => process.env.REACT_APP_MAIN_RPC || clusterApiUrl(network),
        [network]
    );

    // Configure wallet adapters
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletConnectionProvider;
