import React from "react";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const { theme, setTheme } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTheme((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      style={{
        padding: "16px",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#ffffff",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Theme Settings</h2>
      <div style={{ marginTop: "16px" }}>
        <div style={{ marginBottom: "8px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Background Color
          </label>
          <input
            type="color"
            name="backgroundColor"
            value={theme.backgroundColor}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: "8px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Text Color
          </label>
          <input
            type="color"
            name="textColor"
            value={theme.textColor}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: "8px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Font Family
          </label>
          <select
            name="fontFamily"
            value={theme.fontFamily}
            onChange={handleChange}
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Courier New', Courier, monospace">Courier New</option>
            <option value="'Times New Roman', Times, serif">
              Times New Roman
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings;
