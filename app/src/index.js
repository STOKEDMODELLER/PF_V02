import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import WalletConnectionProvider from './components/WalletProvider'; // Your WalletProvider.js
import '@solana/wallet-adapter-react-ui/styles.css';
import { ModalProvider } from './context/ModalContext';
import { PriceProvider } from './context/PriceContext'; // Import PriceProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WalletConnectionProvider>
      <ModalProvider>
        <PriceProvider> {/* Wrap App with PriceProvider */}
          <App />
        </PriceProvider>
      </ModalProvider>
    </WalletConnectionProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
