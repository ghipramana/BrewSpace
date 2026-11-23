import React from 'react';
import { Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = Coffee,
  title = 'Belum Ada Data',
  description = 'Saat ini belum ada item yang dapat ditampilkan.',
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div className="state-container">
      <div className="state-icon-box">
        <Icon size={36} strokeWidth={1.8} />
      </div>
      <h3 className="state-title">{title}</h3>
      <p className="state-desc">{description}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          {actionText}
        </Link>
      )}
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          {actionText}
        </button>
      )}
    </div>
  );
};
