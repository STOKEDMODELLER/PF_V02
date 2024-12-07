// File: src/components/CardStyles.js

export const getCardStyles = ({
    theme = "dark",
    width = "100%",
    padding = "1rem",
    borderRadius = "1rem",
    shadow = true,
    customStyles = {},
  }) => ({
    container: {
      width,
      padding,
      borderRadius,
      backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
      color: theme === "dark" ? "#f8fafc" : "#1f2937",
      boxShadow: shadow ? "0px 4px 10px rgba(0, 0, 0, 0.1)" : "none",
      border: `1px solid ${theme === "dark" ? "#334155" : "#e2e8f0"}`,
      ...customStyles.container,
    },
    title: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      marginBottom: "1rem",
      ...customStyles.title,
    },
    content: {
      gap: "1rem",
      ...customStyles.content,
    },
    infoItem: {
      backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
      borderRadius: "0.5rem",
      padding: "1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      border: `1px solid ${theme === "dark" ? "#334155" : "#e2e8f0"}`,
      ...customStyles.infoItem,
    },
    label: {
      fontSize: "0.875rem",
      color: theme === "dark" ? "#f8fafc" : "#1f2937",
      ...customStyles.label,
    },
    value: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: theme === "dark" ? "#f8fafc" : "#1f2937",
      ...customStyles.value,
    },
    button: {
      backgroundColor: theme === "dark" ? "#2563eb" : "#3b82f6",
      color: "#ffffff",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      transition: "brightness 0.2s",
      ":hover": {
        filter: "brightness(1.1)",
      },
      ...customStyles.button,
    },
  });
  