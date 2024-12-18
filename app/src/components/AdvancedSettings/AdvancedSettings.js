import React, { useState } from "react";
import PropTypes from "prop-types";

const AdvancedSettings = ({ slippage, onUpdateSlippage, onClose }) => {
  const [customSlippage, setCustomSlippage] = useState("");

  const handleCustomInput = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setCustomSlippage(value);
    } else {
      setCustomSlippage("");
    }
  };

  const handleApplyCustomSlippage = () => {
    if (customSlippage) {
      onUpdateSlippage(customSlippage);
    }
    onClose(); // Close the modal after applying the change
  };

  return (
    <div className="flex flex-col gap-y-4">
      <h4 className="text-xl font-semibold text-gray-100">Trade Slippage</h4>
      <p className="text-sm text-gray-400">
        Set the allowed percentage difference between the quoted price and the actual execution price.
      </p>
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-2 bg-gray-800 text-gray-200 px-4 py-2 rounded-md" role="radiogroup">
          {[0.1, 0.5, 1.0].map((value) => (
            <button
              key={value}
              type="button"
              className={`px-4 py-2 rounded-md ${
                slippage === value ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-blue-700"
              }`}
              onClick={() => onUpdateSlippage(value)}
            >
              {value}%
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Custom"
          value={customSlippage}
          onChange={handleCustomInput}
          className="flex-grow px-4 py-2 text-sm text-gray-200 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={handleApplyCustomSlippage}
        disabled={!customSlippage && slippage === null}
        className={`mt-4 px-4 py-2 rounded-md font-semibold ${
          customSlippage || slippage !== null
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
        }`}
      >
        Done
      </button>
    </div>
  );
};

AdvancedSettings.propTypes = {
  slippage: PropTypes.number.isRequired,
  onUpdateSlippage: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdvancedSettings;
