import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const ConnectButton = () => {
  return (
    <div className="flex justify-center">
      <WalletMultiButton className="bg-gradient-to-r from-purple-500 to-green-400 text-white font-semibold px-4 py-2 rounded-full shadow-md transform transition hover:scale-105 hover:shadow-green-400/50 whitespace-nowrap" />
    </div>
  );
};

export default ConnectButton;
