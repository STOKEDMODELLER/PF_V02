// src/components/ConnectButton.js
import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const ConnectButton = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <WalletMultiButton className="bg-gradient-to-r from-purple-500 to-green-400 text-white font-semibold px-6 py-2 rounded-full shadow-md transform transition hover:scale-105 hover:shadow-green-400/50 whitespace-nowrap w-[250px]" />
    </div>
  );
};

export default ConnectButton;
