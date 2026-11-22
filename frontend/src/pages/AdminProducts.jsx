import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Plus, Trash2, X } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { formatRupiah } from '../config/constants';
import { createProduct, deleteProduct, getCategories, getProducts, updateProduct } from '../services/api';

const emptyForm = {
  name: '', category_id: '', origin: '', roast_level: 'Medium', price: '', stock: '',
  description: '', image_url: '', is_featured: false, is_best_seller: false
};

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productResult, categoryResult] = await Promise.all([getProducts(), getCategories()]);
      setProducts(productResult.data || []);
      setCategories(categoryResult.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      ...emptyForm,
      ...product,
      category_id: product.category_id || product.categories?.id || '',
      price: product.price ?? '',
      stock: product.stock ?? ''
    });
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      ...form,
      category_id: Number(form.category_id),
      price: Number(form.price),
      stock: Number(form.stock || 0)
    };
    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        setNotice('Produk berhasil diperbarui.');
      } else {
        await createProduct(payload);
        setNotice('Produk berhasil ditambahkan.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || 'Produk gagal disimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Hapus produk “${product.name}”?`)) return;
    setError('');
    setNotice('');
    try {
      await deleteProduct(product.id);
      setNotice('Produk berhasil dihapus.');
      if (editingId === product.id) resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || 'Produk gagal dihapus.');
    }
  };

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="page-content">
        <div style={{ width: 'min(100% - 32px, 900px)', margin: '28px auto' }}>
          <Link to="/profile" className="btn btn-outline" style={{ marginBottom: 20, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Kembali ke Profil
          </Link>
          <h1 style={{ color: 'var(--primary)', marginBottom: 6 }}>Kelola Produk</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Tambah, ubah, atau hapus produk di katalog BrewSpace.</p>

          {error && <p role="alert" style={{ color: '#B3261E', background: '#FDECEA', padding: 12, borderRadius: 10 }}>{error}</p>}
          {notice && <p role="status" style={{ color: '#256B36', background: '#E8F5E9', padding: 12, borderRadius: 10 }}>{notice}</p>}

          <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', padding: 22, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: 28 }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: 18 }}>{editingId ? 'Edit Produk' : 'Tambah Produk'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 16px' }}>
              <label className="form-group"><span className="form-label">Nama produk *</span><input className="form-input" name="name" value={form.name} onChange={updateField} required /></label>
              <label className="form-group"><span className="form-label">Kategori *</span><select className="form-select" name="category_id" value={form.category_id} onChange={updateField} required><option value="">Pilih kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label className="form-group"><span className="form-label">Asal kopi</span><input className="form-input" name="origin" value={form.origin} onChange={updateField} placeholder="Contoh: Aceh Gayo" /></label>
              <label className="form-group"><span className="form-label">Tingkat sangrai</span><select className="form-select" name="roast_level" value={form.roast_level} onChange={updateField}><option>Light</option><option>Light-Medium</option><option>Medium</option><option>Medium-Dark</option><option>Dark</option></select></label>
              <label className="form-group"><span className="form-label">Harga (Rp) *</span><input className="form-input" type="number" name="price" min="0" value={form.price} onChange={updateField} required /></label>
              <label className="form-group"><span className="form-label">Stok</span><input className="form-input" type="number" name="stock" min="0" value={form.stock} onChange={updateField} /></label>
            </div>
            <label className="form-group" style={{ display: 'block' }}><span className="form-label">URL gambar *</span><input className="form-input" type="url" name="image_url" value={form.image_url} onChange={updateField} placeholder="https://..." required /></label>
            <label className="form-group" style={{ display: 'block' }}><span className="form-label">Deskripsi</span><textarea className="form-textarea" name="description" rows="3" value={form.description} onChange={updateField} /></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 18 }}>
              <label><input type="checkbox" name="is_featured" checked={Boolean(form.is_featured)} onChange={updateField} /> Produk unggulan</label>
              <label><input type="checkbox" name="is_best_seller" checked={Boolean(form.is_best_seller)} onChange={updateField} /> Terlaris</label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : <><Plus size={16} /> {editingId ? 'Simpan Perubahan' : 'Tambah Produk'}</>}</button>
              {editingId && <button className="btn btn-outline" type="button" onClick={resetForm}><X size={16} /> Batal</button>}
            </div>
          </form>

          <h2 style={{ color: 'var(--primary)', marginBottom: 14 }}>Daftar Produk ({products.length})</h2>
          {loading ? <p>Memuat produk…</p> : products.length === 0 ? <p>Belum ada produk.</p> : (
            <div style={{ display: 'grid', gap: 12 }}>
              {products.map((product) => (
                <article key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', borderRadius: 14, padding: 12, boxShadow: 'var(--shadow-sm)' }}>
                  <img src={product.image_url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}><strong>{product.name}</strong><div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{product.categories?.name || categories.find((category) => category.id === product.category_id)?.name || 'Produk'} · {formatRupiah(product.price)} · Stok {product.stock ?? 0}</div></div>
                  <button className="btn btn-outline" type="button" onClick={() => startEdit(product)} aria-label={`Edit ${product.name}`}><Edit2 size={16} /> Edit</button>
                  <button className="btn btn-outline" type="button" onClick={() => handleDelete(product)} aria-label={`Hapus ${product.name}`}><Trash2 size={16} /> Hapus</button>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
