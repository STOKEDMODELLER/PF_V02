const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'], // Include your component files
  theme: {
    extend: {
      backdropFilter: {
        none: 'none',
        blur: 'blur(10px)',
      },
    },
  },
  plugins: [
    require('tailwindcss-filters'), // Add this plugin
  ],
};
