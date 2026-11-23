import React from 'react';

export const LoadingState = ({ message = 'Menyiapkan seduhan kopi terbaik...' }) => {
  return (
    <div className="state-container">
      <div className="spinner"></div>
      <p style={{ marginTop: '16px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        {message}
      </p>
    </div>
  );
};
