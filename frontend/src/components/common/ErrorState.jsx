import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Gagal Memuat Data',
  message = 'Terjadi kendala saat mengambil data dari server. Silakan coba lagi.',
  onRetry
}) => {
  return (
    <div className="state-container">
      <div className="state-icon-box" style={{ backgroundColor: '#FFEBEE', color: '#D32F2F' }}>
        <AlertCircle size={36} strokeWidth={1.8} />
      </div>
      <h3 className="state-title">{title}</h3>
      <p className="state-desc">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline" style={{ display: 'inline-flex', gap: '8px' }}>
          <RefreshCw size={16} />
          <span>Coba Lagi</span>
        </button>
      )}
    </div>
  );
};
