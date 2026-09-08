import React from 'react';
import './Badge.css';

/**
 * Badge Component for standard statuses, rule modes, and priorities.
 * Variants: 'minmax' | 'planifie' | 'surdemande' | 'anomaly' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 */
const Badge = ({ children, variant = 'neutral', size = 'md', className = '', ...props }) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
