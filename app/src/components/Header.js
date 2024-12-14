import React, { useState, useEffect, useRef } from "react";
import ConnectButton from "./ConnectButton";
import "./Header.scss";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle the dropdown menu
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <header className="glass-header">
      <nav className="glass-nav">
        {/* Logo Section */}
        <div className="glass-logo">
          <a href="/" className="logo-link">
            <img
              className="logo-image"
              src="logo.png" // Replace with the actual path to your logo
              alt="Brand Logo"
            />
            <span className="logo-text">SolanaApp</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="glass-nav-links desktop-only">
          {["Home", "Pools", "Portfolio", "Transaction History", "PlatformInfo"].map((link) => (
            <a
              key={link}
              href={`/${link.replace(/\s+/g, "-").toLowerCase()}`}
              className="nav-link"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Desktop Dropdown Menu */}
        <div className="dropdown-wrapper desktop-only" ref={dropdownRef}>
          <button
            type="button"
            className="dropdown-toggle"
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
          >
            Create
            <svg
              className={`dropdown-icon ${isDropdownOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="dropdown-container" role="menu">
              <a href="/tokencreation" className="dropdown-item" role="menuitem">
                Create Tokens
              </a>
              <a href="/create-pool" className="dropdown-item" role="menuitem">
                Create Pools
              </a>
            </div>
          )}
        </div>

        {/* Mobile Connect Button */}
        <div className="mobile-controls mobile-only">
          <ConnectButton />
        </div>
      </nav>
    </header>
  );
};

export default Header;
