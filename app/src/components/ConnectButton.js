// src/components/ConnectButton.js
import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import './Header.scss';

const ConnectButton = () => {
  return (
    <div>
      <WalletMultiButton/>
    </div>
  );
};

export default ConnectButton;
