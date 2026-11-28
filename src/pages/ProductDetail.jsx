import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Heart, ShoppingBag, Plus, Minus,
  MapPin, Check, ArrowRight, Star, X
} from 'lucide-react';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { getProductById, addFavorite, removeFavorite, getProductReviews, saveProductReview } from '../services/api';
import { formatRupiah } from '../config/constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, itemCount } = useCart();
  const { isAdmin, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

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

  useEffect(() => {
    let active = true;
    getProductReviews(id)
      .then((res) => { if (active) setReviews(res.data || []); })
      .catch((err) => { if (active) setReviewError(`Ulasan gagal dimuat: ${err.message}`); });
    return () => { active = false; };
  }, [id]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!user) return;
    if (!rating) { setReviewError('Pilih rating bintang 1 sampai 5.'); return; }
    if (!comment.trim()) { setReviewError('Tulis komentar ulasan terlebih dahulu.'); return; }
    try {
      setReviewLoading(true);
      setReviewError('');
      await saveProductReview({ productId: id, rating, comment, user });
      const res = await getProductReviews(id);
      setReviews(res.data || []);
      setComment('');
      setRating(0);
      setReviewModalOpen(false);
    } catch (err) {
      setReviewError(`Ulasan belum tersimpan. ${err.message}`);
    } finally {
      setReviewLoading(false);
    }
  };

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
    : 0;

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
    if (isAdmin) return;
    try {
      await addItem(product.id, quantity);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    } catch (err) {
      alert('Gagal menambahkan ke keranjang: ' + err.message);
    }
  };

  const handleBuyNow = () => {
    if (isAdmin) return;
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
          {!isAdmin && <button
            onClick={() => navigate('/cart')}
            className="icon-btn mobile-only"
            aria-label="Keranjang"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className="badge-count">{itemCount}</span>}
          </button>}
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
            {!isAdmin && <div className="detail-qty-box">
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
            </div>}

            {/* Desktop Action Buttons (Visible on PC >= 768px) */}
            {!isAdmin ? <div className="detail-actions-desktop desktop-only">
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
                <button type="button" className="review-write-btn" aria-label="Tulis ulasan" title="Tulis ulasan" onClick={() => { setReviewError(''); setReviewModalOpen(true); }}>
                  <Star size={19} />
                </button>
              </div>
            </div> : <Link to="/admin/products" className="btn btn-primary admin-product-management-link">
              Kelola produk ini
            </Link>}
          </div>
        </div>

        <section className="reviews-section" aria-labelledby="reviews-title">
          <div className="reviews-header">
            <h2 className="reviews-title" id="reviews-title">Ulasan Pelanggan</h2>
            <div className="rating-summary" aria-label={`${averageRating.toFixed(1)} dari 5, ${reviews.length} ulasan`}>
              <span className="rating-stars" aria-hidden="true">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={17} fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'} />)}</span>
              <strong>{averageRating ? averageRating.toFixed(1) : '0.0'}</strong>
              <span>({reviews.length} ulasan)</span>
            </div>
          </div>

          {reviews.length ? <div className="reviews-list">
            {reviews.map((review) => <article className="review-card" key={review.id || `${review.user_id}-${review.created_at}`}>
              <div className="review-card-header">
                <div><div className="review-author">{review.author_name || 'Pelanggan'}</div><div className="review-date">{new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
                <div className="rating-stars" aria-label={`${review.rating} dari 5 bintang`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} fill={star <= review.rating ? 'currentColor' : 'none'} />)}</div>
              </div>
              <p className="review-comment">{review.comment}</p>
            </article>)}
          </div> : <p className="review-hint">Belum ada ulasan. Jadilah yang pertama berbagi pengalaman.</p>}
        </section>
      </main>

      {reviewModalOpen && !isAdmin && <div className="review-modal-backdrop" onClick={() => setReviewModalOpen(false)}>
        <section className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title" onClick={(event) => event.stopPropagation()}>
          <div className="review-modal-heading">
            <div><span className="review-modal-eyebrow">PENGALAMAN PELANGGAN</span><h2 id="review-modal-title">Tulis Ulasan</h2></div>
            <button type="button" className="icon-btn" aria-label="Tutup" onClick={() => setReviewModalOpen(false)}><X size={20} /></button>
          </div>
          {user ? <form onSubmit={handleSubmitReview}>
            <label className="form-label">Rating</label>
            <div className="rating-picker" role="radiogroup" aria-label="Pilih rating 1 sampai 5">
              {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" className="rating-star-button" role="radio" aria-checked={rating === star} aria-label={`${star} dari 5 bintang`} onClick={() => setRating(star)}><Star size={28} fill={star <= rating ? 'currentColor' : 'none'} /></button>)}
              {rating > 0 && <span>{rating}/5</span>}
            </div>
            <label className="form-label" htmlFor="review-comment">Ulasan</label>
            <textarea id="review-comment" className="form-textarea" rows="5" maxLength="1000" placeholder="Bagaimana rasa dan aroma kopi ini?" value={comment} onChange={(event) => setComment(event.target.value)} />
            {reviewError && <p className="review-error" role="alert">{reviewError}</p>}
            <button className="btn btn-primary review-submit-btn" type="submit" disabled={reviewLoading}>{reviewLoading ? 'Menyimpan...' : 'Kirim Ulasan'}</button>
          </form> : <p className="review-hint"><Link to="/login">Masuk</Link> untuk memberi rating dan menulis ulasan.</p>}
        </section>
      </div>}

      {/* Added Toast Notification */}
      {addedToast && !isAdmin && (
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
      {!isAdmin && <footer className="detail-bottom-bar mobile-only">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Total Harga</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formatRupiah(product.price * quantity)}
          </span>
        </div>

        <button
          type="button"
          className="review-write-btn"
          aria-label="Tulis ulasan"
          title="Tulis ulasan"
          onClick={() => { setReviewError(''); setReviewModalOpen(true); }}
        >
          <Star size={19} />
        </button>

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
      </footer>}
    </div>
  );
};
