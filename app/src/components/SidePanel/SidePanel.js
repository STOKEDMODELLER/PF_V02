import React from "react";
import PropTypes from "prop-types";

const SidePanel = ({ isOpen, onClose }) => {
    return (
        <div
            className={`fixed top-0 left-0 h-full bg-blue-900 text-white transition-transform duration-300 ${
                isOpen ? "w-72" : "w-0"
            } overflow-hidden shadow-lg z-50`}
        >
            <div className="p-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                    aria-label="Close Side Panel"
                >
                    ✕
                </button>
                <h2 className="text-lg font-bold mb-4">Navigation</h2>
                <ul>
                    <li className="py-2 hover:text-gray-300">Dashboard</li>
                    <li className="py-2 hover:text-gray-300">Settings</li>
                    <li className="py-2 hover:text-gray-300">Logout</li>
                </ul>
            </div>
        </div>
    );
};

SidePanel.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default SidePanel;
