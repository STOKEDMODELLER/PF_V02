// WalletProvider.js
import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    // Remove other adapters if not needed
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import default styles for Wallet Adapter
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletConnectionProvider: FC = ({ children }) => {
    // Set the network to Devnet
    const network = WalletAdapterNetwork.Devnet;

    // Use a cluster API URL for the selected network
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // Configure wallet adapters
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            // Add other wallets as needed, but ensure no duplicates
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletConnectionProvider;
