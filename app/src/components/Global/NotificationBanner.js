// ./components/Global/NotificationBanner.js
import React from 'react';
import PropTypes from 'prop-types';

const NotificationBanner = ({ message, type, onClose }) => {
    const bgColor =
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        type === 'info' ? 'bg-blue-500' : 'bg-gray-500';

    return (
        <div className={`${bgColor} text-white text-center py-2 px-4`}>
            <div className="flex justify-between items-center">
                <span>{message}</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-4 text-white hover:text-gray-300 focus:outline-none"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

NotificationBanner.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'info', 'default']),
    onClose: PropTypes.func,
};

NotificationBanner.defaultProps = {
    type: 'default',
    onClose: null,
};

export default NotificationBanner;
