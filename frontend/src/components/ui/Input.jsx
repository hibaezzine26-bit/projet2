import React from 'react';
import './Input.css';

const Input = ({
  label,
  icon: Icon,
  error,
  helperText,
  className = '',
  containerClassName = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`input-group ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon-left" />}
        <input
          id={inputId}
          className={`input-field ${Icon ? 'with-icon' : ''} ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <span className="error-text">{error}</span>
      ) : helperText ? (
        <span className="helper-text">{helperText}</span>
      ) : null}
    </div>
  );
};

export default Input;
