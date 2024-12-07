import React from 'react';
import ConnectButton from './ConnectButton';
import MobileNavBar from './MobileNavBar';
import HeaderStyleConfig from './config/HeaderStyleConfig';

const Header = () => {
  const { desktop, mobile } = HeaderStyleConfig;

  return (
    <>
      {/* Desktop Header */}
      <header className={desktop.container}>
        <div className={desktop.innerContainer}>
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <img
              src="logo.png" // Replace with your logo file path
              alt="SolanaApp Logo"
              className={desktop.logo}
            />
          </a>

          {/* Navigation Links */}
          <nav className="flex space-x-8 ml-8">
            {['Home', 'Pools', 'Portfolio', 'Transaction-History'].map((link) => (
              <a key={link} href={`/${link.toLowerCase()}`} className={desktop.navLink}>
                {link}
              </a>
            ))}
          </nav>

          {/* Wallet Connect Button */}
          <div className={desktop.walletButtonContainer}>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className={mobile.container}>
        {/* Top Section */}
        <div className={mobile.topSection}>
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <img
              src="logo.png" // Replace with your logo file path
              alt="SolanaApp Logo"
              className={mobile.logo}
            />
          </a>

          {/* Wallet Connect */}
          <div>
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <MobileNavBar />
      </div>
    </>
  );
};

export default Header;
