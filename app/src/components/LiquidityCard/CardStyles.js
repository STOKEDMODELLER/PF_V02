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
    position: "relative",
    backgroundColor: theme === "dark" ? "#2563eb" : "#3b82f6",
    color: "#ffffff",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    transition: "transform 0.2s, box-shadow 0.2s, filter 0.2s",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)", // Add shadow to the button
    overflow: "hidden",

    ":hover": {
      transform: "scale(1.05)",
      boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.3)", // Increase shadow on hover
    },

    "::after": {
      content: '""',
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: theme === "dark" ? "#1e3a8a" : "#1d4ed8", // Darker shade for hover effect
      filter: "blur(8px)", // Apply Gaussian blur
      opacity: "0",
      transition: "opacity 0.3s",
    },

    ":hover::after": {
      opacity: "0.6", // Make the darker shade visible on hover
    },

    ...customStyles.button,
  },
  buttonSmall: {
    backgroundColor: theme === "dark" ? "#2563eb" : "#3b82f6",
    color: "#ffffff",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.875rem",
    transition: "transform 0.2s, box-shadow 0.2s, filter 0.2s",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",

    ":hover": {
      transform: "scale(1.05)",
      boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)",
    },

    "::after": {
      content: '""',
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: theme === "dark" ? "#1e3a8a" : "#1d4ed8",
      filter: "blur(6px)",
      opacity: "0",
      transition: "opacity 0.3s",
    },

    ":hover::after": {
      opacity: "0.6",
    },

    ...customStyles.buttonSmall,
  },
});
