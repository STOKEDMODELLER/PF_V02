import React, { useState } from "react";
import ConnectButton from "./ConnectButton";
import SidePanel from "./SidePanel/SidePanel";
import HeaderStyleConfig from "./config/HeaderStyleConfig";

const Header = () => {
  const { desktop, mobile } = HeaderStyleConfig;
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const headerHeight = "4rem"; // Set the header height explicitly

  const toggleSidePanel = () => setIsSidePanelOpen((prev) => !prev);

  return (
    <>
      {/* Desktop Header */}
      <header className={desktop.container}>
        <div className={desktop.innerContainer}>
          {/* Side Panel Button */}
          <button
            onClick={toggleSidePanel}
            className="inline-flex items-center justify-center text-white h-10 w-10"
            aria-label="Open Side Panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              className="h-6 w-6 text-white"
            >
              <path
                fill="currentColor"
                d="M3.778 17q-.735 0-1.256-.457Q2 16.086 2 15.444V4.556q0-.641.522-1.1A1.84 1.84 0 0 1 3.778 3h12.444q.735 0 1.256.457.522.457.522 1.099v10.888q0 .642-.522 1.1a1.84 1.84 0 0 1-1.256.456zm2.666-1.556V4.556H3.778v10.888zm1.778 0h8V4.556h-8z"
              />
            </svg>
          </button>

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
            {["Home", "Pools", "Portfolio", "Transaction History"].map((link) => (
              <a
                key={link}
                href={`/${link.replace(/\s+/g, "-").toLowerCase()}`}
                className={desktop.navLink}
                aria-label={`Navigate to ${link}`}
              >
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
      </div>

      {/* Side Panel */}
      <SidePanel isOpen={isSidePanelOpen} onClose={toggleSidePanel} headerHeight={headerHeight}>
        <h2 className="text-lg font-bold">Side Panel Content</h2>
        <p>Customise this content based on your needs.</p>
      </SidePanel>
    </>
  );
};

export default Header;
