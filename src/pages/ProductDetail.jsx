import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, ShoppingBag, Plus, Minus,
  MapPin, Check, ArrowRight
} from 'lucide-react';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { getProductById, addFavorite, removeFavorite } from '../services/api';
import { formatRupiah } from '../config/constants';
import { useCart } from '../context/CartContext';
import { Navbar } from '../components/common/Navbar';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, itemCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getProductById(id);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError('Produk tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError(err.message || 'Gagal memuat detail produk');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleToggleFavorite = async () => {
    try {
      if (isFav) {
        await removeFavorite(id);
        setIsFav(false);
      } else {
        await addFavorite(id);
        setIsFav(true);
      }
    } catch (err) {
      console.error('Error toggle fav in detail:', err);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, quantity);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    } catch (err) {
      alert('Gagal menambahkan ke keranjang: ' + err.message);
    }
  };

  const handleBuyNow = () => {
    navigate('/checkout', {
      state: {
        directItem: {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: quantity,
          grind_option: 'Biji Utuh',
          image_url: product.image_url
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="app-container">
        <LoadingState message="Menyiapkan informasi aroma dan cita rasa kopi..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="app-container">
        <div className="page-header-nav">
          <button onClick={() => navigate(-1)} className="icon-btn" aria-label="Kembali">
            <ArrowLeft size={20} />
          </button>
          <span className="page-header-title">Detail Produk</span>
          <div style={{ width: '40px' }} />
        </div>
        <ErrorState
          title="Produk Tidak Ditemukan"
          message={error || 'Kopi yang Anda cari mungkin telah habis atau tidak tersedia.'}
          onRetry={() => navigate('/explore')}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Desktop Navbar */}
      <div className="desktop-only" style={{ width: '100%' }}>
        <Navbar />
      </div>

      {/* Top Floating Nav Bar for Mobile / Breadcrumb Header for Desktop */}
      <div className="detail-top-nav">
        <button
          onClick={() => navigate(-1)}
          className="icon-btn"
          aria-label="Kembali"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleToggleFavorite}
            className="icon-btn"
            aria-label="Favorit"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <Heart size={20} fill={isFav ? '#D32F2F' : 'none'} stroke={isFav ? '#D32F2F' : 'currentColor'} />
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="icon-btn mobile-only"
            aria-label="Keranjang"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className="badge-count">{itemCount}</span>}
          </button>
        </div>
      </div>

      <main className="page-content-standalone">
        <div className="detail-grid-container">
          {/* Left Column: Product Cover Image */}
          <div className="detail-image-box">
            <img
              src={product.image_url}
              alt={product.name}
              className="detail-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Right Column: Content Box */}
          <div className="detail-content">
            {/* Tags */}
            <div className="detail-tags">
              {product.categories?.name && (
                <span className="badge-tag">{product.categories.name}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="detail-title">{product.name}</h1>

            {/* Origin */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              fontSize: '0.86rem',
              color: 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={15} color="var(--secondary)" />
                <span>{product.origin || 'Nusantara Indonesia'}</span>
              </div>
            </div>

            {/* Price */}
            <div className="detail-price">
              {formatRupiah(product.price)}
            </div>

            {/* Description */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <h3 className="option-group-title" style={{ marginTop: 0 }}>Tentang Kopi Ini</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.65 }}>
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="detail-qty-box">
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Jumlah Pesanan
              </span>
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Kurangi kuantitas"
                >
                  <Minus size={14} />
                </button>
                <span className="qty-val">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Tambah kuantitas"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Desktop Action Buttons (Visible on PC >= 768px) */}
            <div className="detail-actions-desktop desktop-only">
              <div className="detail-price-desktop">
                <span className="price-sub">Total Pembelian:</span>
                <span className="price-val">{formatRupiah(product.price * quantity)}</span>
              </div>
              <div className="detail-btns-desktop">
                <button
                  onClick={handleAddToCart}
                  className="btn btn-secondary"
                  style={{ padding: '14px 20px', flex: 1 }}
                >
                  <ShoppingBag size={18} />
                  <span>Tambah Keranjang</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn btn-primary"
                  style={{ padding: '14px 24px', flex: 1.2 }}
                >
                  <span>Beli Sekarang</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Added Toast Notification */}
      {addedToast && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 60,
          animation: 'slideDown 0.2s ease'
        }}>
          <Check size={18} />
          <span>Berhasil dimasukkan ke keranjang!</span>
        </div>
      )}

      {/* Mobile Sticky Bottom Action Bar */}
      <footer className="detail-bottom-bar mobile-only">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Total Harga</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formatRupiah(product.price * quantity)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="btn btn-secondary"
          style={{ padding: '12px 16px' }}
          title="Tambah ke keranjang"
        >
          <ShoppingBag size={18} />
          <span>+ Keranjang</span>
        </button>

        <button
          onClick={handleBuyNow}
          className="btn btn-primary"
          style={{ padding: '12px 20px' }}
        >
          Beli Sekarang
        </button>
      </footer>
    </div>
  );
};
