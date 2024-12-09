import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import GlobalModal from '../components/Global/GlobalModal';

const ModalContext = createContext();

/**
 * Custom hook to access the modal context, providing `showModal` and `closeModal`.
 */
export const useModal = () => useContext(ModalContext);

/**
 * ModalProvider that wraps the application, providing global modal control.
 */
export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isVisible: false,
        title: '',
        content: '',
        footer: null,
        options: {},
    });

    const showModal = (title, content, footer = null, options = {}) => {
        setModalState({
            isVisible: true,
            title,
            content,
            footer,
            options,
        });
    };

    const closeModal = () => {
        setModalState({
            isVisible: false,
            title: '',
            content: '',
            footer: null,
            options: {},
        });
    };

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            {children}
            <GlobalModal
                isVisible={modalState.isVisible}
                title={modalState.title}
                content={modalState.content}
                footer={modalState.footer}
                onClose={closeModal}
                options={modalState.options}
            />
        </ModalContext.Provider>
    );
};

ModalProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
