import React from 'react';

const MobileNavBar = () => {
  return (
    <div className="fixed bottom-0 w-full flex items-center justify-around h-14 bg-gradient-to-b from-[#141852] to-[#0E1139] backdrop-blur-lg border-t border-white/10 shadow-lg z-50 lg:hidden">
      {/* Home */}
      <button className="flex flex-col items-center text-white text-sm font-medium hover:brightness-125 transition">
        <a href="/">
          <svg
            aria-hidden="true"
            focusable="false"
            className="h-6 w-6 mb-1 fill-primary"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="currentColor"
          >
            <path d="M5.22 14.78a.75.75 0 0 0 1.06-1.06L4.56 12h8.69a.75.75 0 0 0 0-1.5H4.56l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3a.75.75 0 0 0 0 1.06l3 3Zm5.56-6.5a.75.75 0 1 1-1.06-1.06l1.72-1.72H2.75a.75.75 0 0 1 0-1.5h8.69L9.72 2.28a.75.75 0 0 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.06l-3 3Z" />
          </svg>
          Home
        </a>
      </button>

      {/* Pools */}
      <button className="flex flex-col items-center text-white text-sm font-medium hover:brightness-125 transition">
        <a href="/pools">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 18"
            className="h-6 w-6 mb-1 fill-primary"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M7.533.194a.83.83 0 0 0-1.066 0s-2.305 1.942-4.149 4.62C1.04 6.67 0 8.878 0 11.045 0 14.884 3.137 18 7 18s7-3.116 7-6.954c0-2.167-1.04-4.374-2.318-6.233C9.838 2.135 7.532.194 7.532.194M6.619 3.14a.59.59 0 0 1 .762 0s1.646 1.402 2.963 3.336C11.258 7.818 12 9.413 12 10.977 12 13.75 9.76 16 7 16s-5-2.25-5-5.023c0-1.564.742-3.159 1.656-4.5A18.9 18.9 0 0 1 6.619 3.14"
              clipRule="evenodd"
            />
          </svg>
          Pools
        </a>
      </button>

      {/* Portfolio */}
      <button className="flex flex-col items-center text-white text-sm font-medium hover:brightness-125 transition">
        <a href="/portfolio">
          <svg
            className="h-6 w-6 mb-1 fill-primary"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.66634 22.5007C2.02467 22.5007 1.47537 22.2722 1.01842 21.8152C0.56148 21.3583 0.333008 20.809 0.333008 20.1673V7.33398C0.333008 6.69232 0.56148 6.14301 1.01842 5.68607C1.47537 5.22912 2.02467 5.00065 2.66634 5.00065H7.33301V2.66732C7.33301 2.02565 7.56148 1.47635 8.01842 1.0194C8.47537 0.562457 9.02468 0.333984 9.66634 0.333984H14.333C14.9747 0.333984 15.524 0.562457 15.9809 1.0194C16.4379 1.47635 16.6663 2.02565 16.6663 2.66732V5.00065H21.333C21.9747 5.00065 22.524 5.22912 22.9809 5.68607C23.4379 6.14301 23.6663 6.69232 23.6663 7.33398V20.1673C23.6663 20.809 23.4379 21.3583 22.9809 21.8152C22.524 22.2722 21.9747 22.5007 21.333 22.5007H2.66634ZM2.66634 20.1673H21.333V7.33398H2.66634V20.1673ZM9.66634 5.00065H14.333V2.66732H9.66634V5.00065Z"
              fill="currentColor"
            />
          </svg>
          Portfolio
        </a>
      </button>
    </div>
  );
};

export default MobileNavBar;
