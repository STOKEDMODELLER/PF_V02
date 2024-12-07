import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Banner = ({ announcementLink, announcementText, title }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Hide the banner when the close button is clicked
  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative flex items-center justify-between bg-blue-700 text-white px-4 py-2 w-full shadow-lg animate-pulse shadow-blue-500/50">
      {/* Left Section: Branding/Title */}
      <div className="flex items-center gap-x-2">
        {/* Logo Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 81 15"
          className="h-4 text-gray-300"
        >
          <path
            fill="currentColor"
            d="M8.152 15q-2.313 0-4.173-.958-1.86-.98-2.92-2.688Q0 9.625 0 7.5t1.06-3.833Q2.12 1.937 3.979.979 5.839 0 8.152 0q2.314 0 4.174.98 1.86.957 2.92 2.666 1.058 1.708 1.059 3.854t-1.06 3.854q-1.06 1.71-2.92 2.688Q10.467 15 8.153 15m0-2.375q1.515 0 2.725-.646a4.94 4.94 0 0 0 1.903-1.833q.692-1.188.692-2.646t-.692-2.625a4.75 4.75 0 0 0-1.903-1.833q-1.211-.667-2.725-.667t-2.724.667a4.75 4.75 0 0 0-1.903 1.833Q2.832 6.042 2.833 7.5q0 1.458.692 2.646a4.94 4.94 0 0 0 1.903 1.833q1.21.646 2.724.646"
          />
        </svg>
        <span className="text-sm font-medium">{title}</span>
      </div>

      {/* Center Section: Announcement Text */}
      <div className="hidden md:block text-sm text-gray-100 font-semibold">
        <span className="text-lg">{announcementText}</span>
      </div>

      {/* Right Section: Link & Close Button */}
      <div className="flex items-center gap-x-2 text-sm">
        <a
          href={announcementLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:text-green-300 transition"
        >
          Announcement
        </a>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded hover:bg-gray-800 transition"
          aria-label="Close banner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="h-4 w-4 text-gray-400"
          >
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

Banner.propTypes = {
  announcementLink: PropTypes.string.isRequired,
  announcementText: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default Banner;
