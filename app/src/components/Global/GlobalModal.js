import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import './GlobalModal.css'; // For modal animations
import { getModalStyles } from './ModalStyles';

const GlobalModal = ({
  isVisible,
  title = '',
  content,
  footer = null,
  onClose,
  options = {},
}) => {
  const modalRef = useRef(null);

  const {
    fixedHeader = false,
    fixedFooter = false,
    showCloseButton = true,
    scrollableContent = false,
    modalWidth = '500px',
    modalHeight = '70%',
    backdropOpacity = 0.85,
    modalOpacity = 0.3,
    zIndex = 50,
    closeOnEscape = true,
    closeOnClickOutside = true,
    theme = 'dark',
    customStyles = {},
  } = options;

  // Get computed styles
  const styles = getModalStyles({ theme, backdropOpacity, modalOpacity, customStyles });

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, closeOnEscape, onClose]);

  // Handle outside click
  const handleOutsideClick = (event) => {
    if (
      isVisible &&
      closeOnClickOutside &&
      modalRef.current &&
      !modalRef.current.contains(event.target)
    ) {
      onClose();
    }
  };

  return (
    <CSSTransition
      in={isVisible}
      timeout={300}
      classNames="modal"
      unmountOnExit
    >
      <div
        className={classNames(
          'fixed inset-0 flex items-center justify-center transition-opacity duration-300'
        )}
        style={{
          backgroundColor: styles.backdropColor,
          zIndex,
        }}
        onClick={handleOutsideClick}
      >
        <div
          ref={modalRef}
          className="rounded-lg shadow-lg flex flex-col relative opacity-100 backdrop-blur-lg"
          style={{
            width: modalWidth,
            maxHeight: '90vh',
            backgroundColor: styles.background,
            color: styles.textColor,
            borderColor: styles.borderColor,
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.9)', // Dark shadow for contrast
            borderRadius: '1rem',
            transition: 'opacity 300ms ease, transform 300ms ease',
            ...customStyles.container,
          }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div
              className={classNames(
                'flex items-center justify-between px-4 py-3 border-b',
                fixedHeader ? 'sticky top-0 z-10' : ''
              )}
              style={{
                borderColor: styles.borderColor,
                backgroundColor: styles.background,
                ...customStyles.header,
              }}
            >
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="focus:outline-none text-gray-400 hover:text-gray-600"
                  aria-label="Close Modal"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className={classNames('flex-1')}
            style={{
              padding: '1rem',
              overflow: scrollableContent ? 'hidden' : 'visible',
              ...customStyles.content,
            }}
          >
            {scrollableContent ? (
              <SimpleBar
                style={{
                  maxHeight: 'calc(90vh - 6rem)',
                }}
                autoHide
              >
                {content}
              </SimpleBar>
            ) : (
              content
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className={classNames(
                'px-4 py-3 border-t',
                fixedFooter ? 'sticky bottom-0 z-10' : ''
              )}
              style={{
                borderColor: styles.borderColor,
                backgroundColor: styles.background,
                ...customStyles.footer,
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </CSSTransition>
  );
};

GlobalModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  title: PropTypes.string,
  content: PropTypes.node.isRequired,
  footer: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  options: PropTypes.shape({
    fixedHeader: PropTypes.bool,
    fixedFooter: PropTypes.bool,
    showCloseButton: PropTypes.bool,
    scrollableContent: PropTypes.bool,
    modalWidth: PropTypes.string,
    modalHeight: PropTypes.string,
    backdropOpacity: PropTypes.number,
    modalOpacity: PropTypes.number,
    zIndex: PropTypes.number,
    closeOnEscape: PropTypes.bool,
    closeOnClickOutside: PropTypes.bool,
    theme: PropTypes.oneOf(['light', 'dark']),
    customStyles: PropTypes.object,
  }),
};

export default GlobalModal;
