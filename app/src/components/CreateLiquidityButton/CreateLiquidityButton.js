// ./components/CreateLiquidityButton/CreateLiquidityButton.js
import React, { useState } from "react";
import PropTypes from "prop-types";

const CreateLiquidityButton = ({ onCreate, disabled = false }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleClick = async () => {
        if (disabled || isProcessing) return;

        setIsProcessing(true);
        try {
            await onCreate();
        } catch (error) {
            console.error("Error creating liquidity:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                disabled || isProcessing
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:brightness-110 text-white"
            }`}
            onClick={handleClick}
            disabled={disabled || isProcessing}
        >
            {isProcessing ? "Processing..." : "Create Liquidity"}
        </button>
    );
};

CreateLiquidityButton.propTypes = {
    onCreate: PropTypes.func.isRequired, // Function to execute when the button is clicked
    disabled: PropTypes.bool, // Optionally disable the button
};

export default CreateLiquidityButton;
