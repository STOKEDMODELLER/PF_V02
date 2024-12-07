import PropTypes from 'prop-types';

// Centralised styles for the GlobalModal
export const getModalStyles = ({
  theme,
  backdropOpacity,
  modalOpacity,
  customStyles = {},
}) => {
  const defaultStyles = {
    light: {
      background: `rgba(255, 255, 255, ${modalOpacity})`, // Translucent white
      textColor: '#000000',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      backdropColor: `rgba(0, 0, 0, ${backdropOpacity})`,
    },
    dark: {
      background: `rgba(30, 30, 47, ${modalOpacity})`, // Translucent dark
      textColor: '#FFFFFF',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      backdropColor: `rgba(0, 0, 0, ${backdropOpacity})`,
    },
  };

  return {
    ...defaultStyles[theme],
    ...customStyles,
  };
};

getModalStyles.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark']).isRequired,
  backdropOpacity: PropTypes.number.isRequired,
  modalOpacity: PropTypes.number.isRequired,
  customStyles: PropTypes.object,
};
