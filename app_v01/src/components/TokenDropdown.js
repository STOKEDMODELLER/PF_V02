import React, { useState } from "react";

const TokenDropdown = ({ tokens, selectedToken, onTokenChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const styles = {
    tokenDropdown: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      background: "rgba(28, 35, 115, 0.9)",
      border: "1px solid rgba(110, 133, 247, 0.5)",
      borderRadius: "8px",
      color: "white",
      padding: "5px 10px",
      cursor: "pointer",
    },
    tokenIcon: {
      width: "24px",
      height: "24px",
      borderRadius: "50%",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modal: {
      background: "linear-gradient(180deg, rgba(42, 49, 126, 0.9), rgba(28, 35, 115, 0.9))",
      borderRadius: "12px",
      padding: "20px",
      width: "90%",
      maxWidth: "400px",
      maxHeight: "80vh",
      overflowY: "auto",
      color: "white",
    },
    searchInput: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid rgba(110, 133, 247, 0.5)",
      marginBottom: "20px",
      background: "rgba(28, 35, 115, 0.8)",
      color: "white",
      fontSize: "1rem",
      outline: "none",
    },
    tokenList: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    tokenItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px",
      borderRadius: "8px",
      background: "rgba(28, 35, 115, 0.8)",
      cursor: "pointer",
      transition: "background 0.3s",
    },
    tokenItemHover: {
      background: "rgba(42, 49, 126, 0.8)",
    },
    closeButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      background: "none",
      border: "none",
      color: "white",
      fontSize: "1.5rem",
      cursor: "pointer",
    },
  };

  const filteredTokens = tokens.filter((token) =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Token Dropdown Trigger */}
      <div
        style={styles.tokenDropdown}
        onClick={() => setIsModalOpen(true)}
      >
        <img
          src={
            tokens.find((token) => token.id === selectedToken)?.image ||
            "https://via.placeholder.com/24"
          }
          alt={selectedToken}
          style={styles.tokenIcon}
        />
        {selectedToken.toUpperCase()}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={styles.closeButton}
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <input
              type="text"
              placeholder="Search tokens..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div style={styles.tokenList}>
              {filteredTokens.map((token) => (
                <div
                  key={token.id}
                  style={styles.tokenItem}
                  onClick={() => {
                    onTokenChange(token.id);
                    setIsModalOpen(false);
                  }}
                >
                  <img
                    src={token.image}
                    alt={token.symbol}
                    style={styles.tokenIcon}
                  />
                  {token.symbol.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TokenDropdown;
