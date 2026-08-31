import React from 'react';
import './Input.css';

const Input = ({ label, className = '', error, ...props }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input className={`input-field ${error ? 'input-error' : ''}`} {...props} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;
