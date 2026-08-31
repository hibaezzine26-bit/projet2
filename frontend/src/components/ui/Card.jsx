import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`glass glass-card ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
