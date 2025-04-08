import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onDismiss }) => {
  return (
    <div className="error-message">
      <p>{message}</p>
      <button onClick={onDismiss} className="dismiss-button">×</button>
    </div>
  );
};

export default ErrorMessage;
