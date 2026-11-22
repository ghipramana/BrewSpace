import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Plus } from 'lucide-react';
import { formatRupiah } from '../../config/constants';
import { addFavorite, removeFavorite } from '../../services/api';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product, isFavoriteInitial = false, onFavoriteToggle }) => {
  const [isFav, setIsFav] = useState(isFavoriteInitial);
  const [favLoading, setFavLoading] = useState(false);
  const { addItem } = useCart();
  const [addedAnim, setAddedAnim] = useState(false);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (favLoading) return;

    try {
      setFavLoading(true);
      if (isFav) {
        await removeFavorite(product.id);
        setIsFav(false);
      } else {
        await addFavorite(product.id);
        setIsFav(true);
      }
      if (onFavoriteToggle) onFavoriteToggle(product.id, !isFav);
    } catch (err) {
      console.error('Error toggle favorite:', err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product.id, 1, 'Biji Utuh');
      setAddedAnim(true);
      setTimeout(() => setAddedAnim(false), 1200);
    } catch (err) {
      console.error('Error quick add:', err);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-image-box">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <button
          className={`fav-badge-btn ${isFav ? 'active' : ''}`}
          onClick={handleToggleFavorite}
          aria-label="Tambah ke Favorit"
        >
          <Heart size={16} fill={isFav ? '#D32F2F' : 'none'} strokeWidth={isFav ? 0 : 2} />
        </button>
      </div>

      <div className="product-body">
        <div className="product-meta">
          <span>{product.origin ? product.origin.split(',')[0] : 'Nusantara'}</span>
          <span className="product-rating">
            <Star size={13} fill="#E65100" strokeWidth={0} />
            {product.rating || '4.8'}
          </span>
        </div>

        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        <div className="product-price-row">
          <span className="product-price">{formatRupiah(product.price)}</span>
          <button
            className="btn-add-mini"
            onClick={handleQuickAdd}
            aria-label="Tambah ke keranjang"
            title="Tambah ke keranjang"
            style={{
              backgroundColor: addedAnim ? 'var(--primary)' : 'var(--surface-alt)',
              color: addedAnim ? '#FFFFFF' : 'var(--primary)'
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </Link>
  );
};
