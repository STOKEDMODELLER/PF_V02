import React from "react";

const Banner = ({ message, type, onClose }) => {
  const bannerStyles = {
    info: { background: "linear-gradient(145deg, #4F46E5, #3A39D9)", color: "#fff" },
    warning: { background: "linear-gradient(145deg, #FFA500, #FF8C00)", color: "#fff" },
    error: { background: "linear-gradient(145deg, #FF6347, #FF4500)", color: "#fff" },
  };

  return (
    <div style={{ ...styles.banner, ...bannerStyles[type] }}>
      <p style={styles.message}>{message}</p>
      <button style={styles.closeButton} onClick={onClose}>
        ✖
      </button>
    </div>
  );
};

const styles = {
  banner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "8px",
    margin: "16px",
    padding: "16px 20px",
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)", // Add a subtle shadow
    fontFamily: "Arial, sans-serif",
  },
  message: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: "500",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "50%",
    transition: "background 0.3s ease",
  },
  closeButtonHover: {
    background: "rgba(255, 255, 255, 0.2)",
  },
};

export default Banner;
