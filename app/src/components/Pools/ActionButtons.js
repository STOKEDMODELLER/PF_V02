import React from "react";

const ActionButtons = () => (
  <div className="flex items-center gap-3 p-4">
    <button
      type="button"
      className="inline-flex items-center justify-center h-11 px-2 rounded-md text-base font-medium text-[#EEEFF6] border border-blue-200/5 shadow-md bg-gradient-to-b from-[#6E85F71A] to-[#6E85F713] backdrop-blur hover:brightness-125 focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 22 18"
        className="h-5 w-5"
      >
        <path
          fill="#EEEFF6"
          fillRule="evenodd"
          d="M21.5 1.742v.405c0 .476-.196.93-.541 1.26l-6.345 6.032c-.23.22-.361.523-.361.84v5.98c0 .961-.784 1.741-1.75 1.741H9.575c-.966 0-1.75-.78-1.75-1.742v-5.974c0-.32-.132-.625-.365-.845L1.048 3.41A1.74 1.74 0 0 1 .5 2.141v-.4C.5.78 1.284 0 2.25 0h17.5c.966 0 1.75.78 1.75 1.742"
          clipRule="evenodd"
        />
      </svg>
    </button>
    <button
      type="button"
      className="inline-flex items-center justify-center h-11 w-11 rounded-md text-base font-medium text-[#EEEFF6] border border-blue-200/5 shadow-md bg-gradient-to-b from-[#6E85F71A] to-[#6E85F713] backdrop-blur hover:brightness-125 focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 16 16"
        className="h-5 w-5"
      >
        <path d="..." />
      </svg>
    </button>
  </div>
);

export default ActionButtons;
