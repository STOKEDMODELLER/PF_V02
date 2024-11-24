import React, { useState } from 'react';
import ConnectButton from './ConnectButton';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Branding */}
        <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-green-400">
          <a href="/">SolanaApp</a>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6 hover:text-purple-400 transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav
          className={`${
            isMenuOpen ? "block" : "hidden"
          } absolute top-16 left-0 w-full bg-gray-900 md:static md:flex md:space-x-6 md:items-center md:justify-center`}
        >
          <div className="flex flex-col md:flex-row md:space-x-6 items-center justify-center">
            <a
              href="#home"
              className="block py-2 px-4 text-lg hover:text-green-400 transition md:hover:text-purple-400"
            >
              Home
            </a>
            <a
              href="#about"
              className="block py-2 px-4 text-lg hover:text-green-400 transition md:hover:text-purple-400"
            >
              About
            </a>
            <a
              href="#services"
              className="block py-2 px-4 text-lg hover:text-green-400 transition md:hover:text-purple-400"
            >
              Services
            </a>
            <a
              href="#contact"
              className="block py-2 px-4 text-lg hover:text-green-400 transition md:hover:text-purple-400"
            >
              Contact
            </a>
          </div>
        </nav>

        {/* Wallet Connect */}
        <div className="hidden md:block">
          <ConnectButton />
        </div>
      </div>

      {/* Fixed Wallet Connect for Mobile */}
      <div className="md:hidden fixed bottom-4 left-0 w-full px-4 flex justify-center z-10">
        <ConnectButton />
      </div>
    </header>
  );
};

export default Header;
