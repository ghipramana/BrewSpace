import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBadge = () => {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="offline-banner">
        <WifiOff size={16} />
        <span>Anda sedang offline. Menampilkan katalog dari cache perangkat.</span>
      </div>
    );
  }

  if (wasOffline) {
    return (
      <div className="offline-banner" style={{ backgroundColor: '#2E7D32' }}>
        <Wifi size={16} />
        <span>Koneksi internet terhubung kembali!</span>
      </div>
    );
  }

  return null;
};
