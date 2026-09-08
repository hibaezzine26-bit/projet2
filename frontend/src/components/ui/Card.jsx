import React from 'react';
import './Card.css';

const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  ...props
}) => {
  const hasHeader = title || subtitle || Icon || action;

  return (
    <div className={`card ${className}`} {...props}>
      {hasHeader && (
        <div className={`card-header ${headerClassName}`}>
          <div className="card-header-left">
            {Icon && (
              <div className="card-icon-wrap">
                <Icon size={18} className="card-icon" />
              </div>
            )}
            <div>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
