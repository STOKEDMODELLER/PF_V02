import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Include global CSS
import App from './App'; // Main App component
import reportWebVitals from './reportWebVitals'; // Optional for measuring performance
import WalletConnectionProvider from './components/WalletProvider'; // Solana Wallet provider
import '@solana/wallet-adapter-react-ui/styles.css'; // Wallet adapter UI styles
import { ModalProvider } from './context/ModalContext'; // Context for managing modals
import { PriceProvider } from './context/PriceContext'; // Context for price-related data

// Root DOM element
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* Wallet Connection Context */}
    <WalletConnectionProvider>
      {/* Global Modal Context */}
      <ModalProvider>
        {/* Price Context for Price-related Data */}
        <PriceProvider>
          {/* Main Application */}
          <App />
        </PriceProvider>
      </ModalProvider>
    </WalletConnectionProvider>
  </React.StrictMode>
);

// Optional: Measure app performance
// Pass a function to log results or send to an analytics endpoint
reportWebVitals();
