import React from 'react';
import ReactDOM from 'react-dom';

const SimpleModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Don't render the modal if it's not open

  return ReactDOM.createPortal(
    <div style={modalStyles.overlay}>
        {children}
        <button style={modalStyles.closeButton} onClick={onClose}>
          <div style ={{marginRight: '2vw'}}>
          <h2>X</h2>
          </div>
        </button>
    </div>,
    document.getElementById('root') // The modal renders in this DOM element
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    textSize: '3rem'
  },
  content: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
    textAlign: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#ffffff'
  },
};

export default SimpleModal;
