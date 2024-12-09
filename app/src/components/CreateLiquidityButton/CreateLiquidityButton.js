import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ButtonStyleController from "./ButtonStyleController";

const CreateLiquidityButton = ({ onCreate }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState(""); // Tracks status ("loading", "success", or "error")
    const [cooldown, setCooldown] = useState(0); // Cooldown timer in seconds

    const handleClick = async () => {
        if (isProcessing || cooldown > 0) return;

        setIsProcessing(true);
        setStatus("loading");

        try {
            await onCreate();
            setStatus("success");
            setCooldown(5); // Set cooldown for 5 seconds
        } catch (error) {
            console.error("Error creating liquidity:", error);
            setStatus("error");
            setCooldown(5); // Set cooldown for 5 seconds even on error
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        setStatus(""); // Reset status after cooldown
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const progressBarStyle = {
        width: `${(5 - cooldown) * 20}%`, // Adjust bar width based on cooldown
        backgroundColor: "gray",
        height: "4px",
        transition: "width 1s linear",
    };

    // Use ButtonStyleController to dynamically calculate styles
    const styles = ButtonStyleController({ status, cooldown, isProcessing });

    const getButtonText = () => {
        if (isProcessing) return "Hold tight, processing...";
        if (status === "success") return "Success! Pool Launched!";
        if (status === "error") return "Something went wrong. Try again?";
        if (cooldown > 0) return `Try again in (${cooldown}s)`;
        return "Launch Your Pool";
    };

    return (
        <div className="relative w-full">
            <button
                className={`w-full px-4 py-2 text-sm rounded-lg transition-all transform focus:outline-none ${styles.backgroundColor} ${styles.textColor} ${styles.cursor}`}
                style={{ filter: styles.filter }}
                onClick={handleClick}
                disabled={isProcessing || cooldown > 0}
            >
                {getButtonText()}
            </button>
            {cooldown > 0 && (
                <div className="absolute bottom-0 left-0 right-0">
                    <div style={progressBarStyle} />
                </div>
            )}
        </div>
    );
};

CreateLiquidityButton.propTypes = {
    onCreate: PropTypes.func.isRequired, // Function to execute when the button is clicked
};

export default CreateLiquidityButton;
