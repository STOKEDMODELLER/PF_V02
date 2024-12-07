
// ./context/ModalContext.js
import React, { createContext, useState, useContext } from 'react';
import GlobalModal from '../components/Global/GlobalModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

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
