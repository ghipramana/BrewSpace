import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { ProductCard } from '../components/product/ProductCard';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { getCategories, getProducts } from '../services/api';

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const selectedCategory = searchParams.get('category_id') || '';
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res.success) setCategories(res.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Load products based on filters
  const fetchFilteredProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (sortOption) params.sort = sortOption;

      const res = await getProducts(params);
      if (res.success) {
        setProducts(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Gagal memuat katalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [selectedCategory, sortOption]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFilteredProducts();
  };

  const handleCategorySelect = (catId) => {
    const newParams = new URLSearchParams(searchParams);
    if (!catId) {
      newParams.delete('category_id');
    } else {
      newParams.set('category_id', catId);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortOption(val);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', val);
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    setSearchQuery('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
    // Reload tanpa query
    getProducts({
      category_id: selectedCategory || undefined,
      sort: sortOption
    }).then(res => setProducts(res.data || []));
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="page-content">
        {/* Title & Filter Bar */}
        <div className="page-title-section">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 700 }}>
            Jelajahi Kopi Pilihan
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Temukan biji, bubuk, dan sajian kopi spesial dari berbagai penjuru tanah air.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="search-container">
          <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Cari nama kopi, daerah asal..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </form>
        </div>

        {/* Horizontal Category Chips */}
        <div className="categories-scroll">
          <button
            className={`category-chip ${!selectedCategory ? 'active' : ''}`}
            onClick={() => handleCategorySelect('')}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-chip ${selectedCategory === String(cat.id) ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Controls & Count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 18px 4px 18px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <span>Menampilkan <strong>{products.length}</strong> produk</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal size={14} />
            <select
              value={sortOption}
              onChange={handleSortChange}
              style={{
                border: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-main)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Terbaru</option>
              <option value="price_asc">Harga: Termurah</option>
              <option value="price_desc">Harga: Termahal</option>
            </select>
          </div>
        </div>

        {/* Products Grid / States */}
        {loading ? (
          <LoadingState message="Menyaring koleksi kopi terbaik..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchFilteredProducts} />
        ) : products.length === 0 ? (
          <EmptyState
            title="Kopi Tidak Ditemukan"
            description="Tidak ada produk kopi yang sesuai dengan kriteria pencarian atau filter yang dipilih."
            actionText="Reset Pencarian"
            onAction={() => {
              clearSearch();
              handleCategorySelect('');
            }}
          />
        ) : (
          <div className="products-grid">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};
