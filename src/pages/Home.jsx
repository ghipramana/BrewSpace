import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, Award } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { ProductCard } from '../components/product/ProductCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { getCategories, getProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch kategori dan produk secara paralel
      const [catRes, featRes, allRes] = await Promise.all([
        getCategories(),
        getProducts({ is_featured: true, limit: 4 }),
        getProducts({ limit: 4 })
      ]);

      if (catRes.success) setCategories(catRes.data || []);
      if (featRes.success) setFeaturedProducts(featRes.data || []);
      if (allRes.success) setLatestProducts(allRes.data || []);
    } catch (err) {
      console.error('Error fetching home data:', err);
      setError(err.message || 'Gagal memuat katalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Penikmat Kopi';

  return (
    <div className="app-container">
      <Navbar />

      <main className="page-content">
        {/* Greeting Section */}
        <div className="home-greeting-section">
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Selamat datang,
          </p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 700 }}>
            {displayName} 👋
          </h2>
        </div>

        {/* Search Input Bar */}
        <div className="search-container">
          <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Cari biji Gayo, Toraja, Cold Brew..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Promo Hero Banner */}
        <div className="promo-card">
          <span className="promo-tag">Promo Awal Pekan</span>
          <h3 className="promo-headline">Diskon 20% Koleksi Biji Kopi Nusantara</h3>
          <p className="promo-desc">
            Nikmati aroma segar dari lereng pegunungan terbaik Indonesia langsung ke cangkirmu.
          </p>
          <Link to="/explore?category_id=1" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            Belanja Sekarang
          </Link>
        </div>

        {/* Categories Chips */}
        <div className="section-header" style={{ paddingTop: '8px' }}>
          <h3 className="section-title">Kategori Kopi</h3>
        </div>
        <div className="categories-scroll">
          <button
            className="category-chip active"
            onClick={() => navigate('/explore')}
          >
            ☕ Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="category-chip"
              onClick={() => navigate(`/explore?category_id=${cat.id}`)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState message="Menyeduh pilihan kopi terbaik untukmu..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadHomeData} />
        ) : (
          <>
            {/* Section: Rekomendasi Pilihan (Featured) */}
            {featuredProducts.length > 0 && (
              <section>
                <div className="section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={20} color="#795548" />
                    <h3 className="section-title">Pilihan BrewSpace</h3>
                  </div>
                  <Link to="/explore" className="section-link">
                    <span>Lihat Semua</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="products-grid">
                  {featuredProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              </section>
            )}

            {/* Section: Kopi Terbaru */}
            {latestProducts.length > 0 && (
              <section>
                <div className="section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={20} color="#3E2723" />
                    <h3 className="section-title">Kopi Terbaru</h3>
                  </div>
                  <Link to="/explore" className="section-link">
                    <span>Lihat Semua</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="products-grid">
                  {latestProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};
