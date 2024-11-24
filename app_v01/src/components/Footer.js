import React from "react";

const Footer = () => {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "linear-gradient(135deg, #24243e, #1b1b2d)", // Matching gradient style
        color: "white",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        padding: "10px 0",
        boxShadow: "0px -4px 12px rgba(0, 0, 0, 0.5)", // Subtle shadow
        zIndex: 1000,
      }}
    >
      <p style={{ margin: 0, fontSize: "0.9rem" }}>
        &copy; 2024 DeFi Platform. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
