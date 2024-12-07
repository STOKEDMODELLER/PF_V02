// ./context/NotificationContext.js
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import NotificationBanner from '../components/Global/NotificationBanner';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, type = 'default', duration = 3000) => {
        setNotification({ message, type });
        if (duration > 0) {
            setTimeout(() => setNotification(null), duration);
        }
    }, []);

    const closeNotification = useCallback(() => setNotification(null), []);

    const contextValue = useMemo(() => ({ showNotification }), [showNotification]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            {notification && (
                <NotificationBanner
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}
        </NotificationContext.Provider>
    );
};
