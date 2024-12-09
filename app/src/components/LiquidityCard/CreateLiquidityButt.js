import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { getCardStyles } from "./CardStyles";

const CreateLiquidityButton = ({ theme = "dark" }) => {
  const styles = getCardStyles({ theme });
  const navigate = useNavigate(); // Use React Router's useNavigate

  const handleClick = () => {
    navigate("/create-pool"); // Redirect to the Create Pool page
  };

  return (
    <button
      onClick={handleClick}
      style={styles.button}
    >
      Create Pool
    </button>
  );
};

CreateLiquidityButton.propTypes = {
  theme: PropTypes.string, // Theme for styling
};

export default CreateLiquidityButton;
