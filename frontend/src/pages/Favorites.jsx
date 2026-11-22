import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { ProductCard } from '../components/product/ProductCard';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { getFavorites } from '../services/api';

export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFavorites();
      if (res.success) {
        setFavorites(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message || 'Gagal memuat daftar favorit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFavorites();
  }, []);

  const handleFavoriteToggle = (productId, isFav) => {
    if (!isFav) {
      // Hapus dari list lokal
      setFavorites(prev => prev.filter(f => f.product_id !== productId && f.products?.id !== productId));
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="page-content">
        <div className="page-title-section">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 700 }}>
            Kopi Favorit Saya
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Daftar biji dan minuman kopi pilihan yang telah Anda simpan.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Memuat daftar kopi kesukaanmu..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchUserFavorites} />
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Belum Ada Favorit"
            description="Tandai produk kopi yang Anda sukai dengan menekan ikon hati agar mudah ditemukan kembali."
            actionText="Jelajahi Produk Kopi"
            actionLink="/explore"
          />
        ) : (
          <div className="products-grid">
            {favorites.map((fav) => {
              const prod = fav.products || fav;
              return (
                <ProductCard
                  key={fav.id || prod.id}
                  product={prod}
                  isFavoriteInitial={true}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};
