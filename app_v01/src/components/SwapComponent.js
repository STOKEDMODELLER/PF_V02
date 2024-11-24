import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import TokenDropdown from "./TokenDropdown";

const SwapComponent = () => {
  const { theme } = useTheme();
  const [tokens, setTokens] = useState([]);
  const [inputToken, setInputToken] = useState("bitcoin");
  const [outputToken, setOutputToken] = useState("ethereum");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1"
        );
        const data = await response.json();
        setTokens(data);
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    };

    fetchTokens();
  }, []);

  const handleSwap = () => {
    console.log(`Swapping ${amount} ${inputToken} to ${outputToken}`);
  };

  const handleSwitchTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "10vh",
      padding: "10px 20px", // Reduced top and bottom padding
    },
    card: {
      width: "100%",
      maxWidth: "400px",
      background: "linear-gradient(180deg, rgba(42, 49, 126, 0.25), rgba(28, 35, 115, 0.25))",
      backdropFilter: "blur(8px)",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.2)",
    },
    title: {
      fontSize: "1.8rem",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "20px",
      color: "white",
    },
    inputSection: {
      display: "flex",
      gap: "20px",
      padding: "15px", // Adjusted padding for the input sections
      alignItems: "center",
      borderRadius: "10px",
      background: "linear-gradient(to bottom, rgba(9, 12, 52, 0.8), rgba(8, 10, 43, 0.8))",
      boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.2) inset",
      border: "1px solid rgba(110, 133, 247, 0.2)",
      marginBottom: "15px",
    },
    inputDetails: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      gap: "5px",
    },
    label: {
      fontSize: "0.9rem",
      color: "rgba(255, 255, 255, 0.8)",
    },
    input: {
      background: "transparent",
      border: "none",
      fontSize: "2rem",
      color: "white",
      width: "100%",
    },
    subText: {
      fontSize: "0.85rem",
      color: "rgba(255, 255, 255, 0.6)",
    },
    switchButton: {
      margin: "5px auto", // Reduced vertical margin for the switch button
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      background: "linear-gradient(to bottom, #1F277A, #1D2472)",
      borderRadius: "50%",
      color: "white",
      fontSize: "1.5rem",
      cursor: "pointer",
      border: "1px solid rgba(110, 133, 247, 0.5)",
      boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.2)",
    },
    button: {
      marginTop: "15px", // Reduced top margin for the swap button
      padding: "12px",
      width: "100%",
      fontSize: "1rem",
      fontWeight: "bold",
      background: "linear-gradient(to bottom, #6E85F7, #4A60E8)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
    },
  };
  

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Swap Tokens</h2>

        {/* Pay Section */}
        <div style={styles.inputSection}>
          <div style={styles.inputDetails}>
            <span style={styles.label}>Pay</span>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.input}
            />
            <span style={styles.subText}>$0.00</span>
          </div>
          <TokenDropdown
            tokens={tokens}
            selectedToken={inputToken}
            onTokenChange={setInputToken}
          />
        </div>

        {/* Switch Button */}
        <div style={styles.switchButton} onClick={handleSwitchTokens}>
          ↕
        </div>

        {/* Receive Section */}
        <div style={styles.inputSection}>
          <div style={styles.inputDetails}>
            <span style={styles.label}>Receive</span>
            <input
              type="text"
              placeholder="0"
              value=""
              readOnly
              style={styles.input}
            />
            <span style={styles.subText}>$0.00</span>
          </div>
          <TokenDropdown
            tokens={tokens}
            selectedToken={outputToken}
            onTokenChange={setOutputToken}
          />
        </div>

        <button
          style={styles.button}
          onClick={handleSwap}
          disabled={!amount || !inputToken || !outputToken}
        >
          Swap
        </button>
      </div>
    </div>
  );
};

export default SwapComponent;
