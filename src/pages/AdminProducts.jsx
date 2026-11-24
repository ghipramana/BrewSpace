import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Plus, Trash2, X } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { formatRupiah } from '../config/constants';
import { createProduct, deleteProduct, getCategories, getProducts, updateProduct, uploadProductImage } from '../services/api';

const emptyForm = {
  name: '', category_id: '', origin: '', price: '', stock: '',
  description: '', image_url: ''
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

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
    setImageFile(null);
    setImagePreview('');
    setEditingId(product.id);
    setForm({
      ...emptyForm,
      name: product.name ?? '',
      category_id: product.category_id || product.categories?.id || '',
      origin: product.origin ?? '',
      price: product.price ?? '',
      stock: product.stock ?? '',
      description: product.description ?? '',
      image_url: product.image_url ?? ''
    });
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    if (!imageFile && !form.image_url) {
      setError('Pilih gambar produk terlebih dahulu.');
      setSaving(false);
      return;
    }
    const payload = {
      ...form,
      category_id: Number(form.category_id),
      price: Number(form.price),
      stock: Number(form.stock || 0)
    };
    try {
      if (imageFile) payload.image_url = await uploadProductImage(imageFile);
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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Pilih file gambar yang valid.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5 MB.');
      event.target.value = '';
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="page-content">
        <div style={{ width: 'min(100% - 32px, 900px)', margin: '28px auto' }}>
          <Link to="/admin" className="btn btn-outline" style={{ marginBottom: 20, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Kembali ke Dashboard Admin
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
              <label className="form-group"><span className="form-label">Harga (Rp) *</span><input className="form-input" type="number" name="price" min="0" value={form.price} onChange={updateField} required /></label>
              <label className="form-group"><span className="form-label">Stok</span><input className="form-input" type="number" name="stock" min="0" value={form.stock} onChange={updateField} /></label>
            </div>
            <div className="form-group" style={{ display: 'block' }}>
              <label className="form-label" htmlFor="product-image">Foto produk *</label>
              <input id="product-image" className="form-input" type="file" accept="image/*" onChange={handleImageChange} />
              <small style={{ display: 'block', color: 'var(--text-muted)', marginTop: 6 }}>Pilih dari galeri Foto atau Files di HP, atau dari komputer. Maksimal 5 MB.{editingId && ' Kosongkan jika ingin memakai foto yang sekarang.'}</small>
              {(imagePreview || form.image_url) && <img src={imagePreview || form.image_url} alt="Pratinjau foto produk" style={{ display: 'block', width: 140, height: 110, objectFit: 'cover', borderRadius: 12, marginTop: 12 }} />}
            </div>
            <label className="form-group" style={{ display: 'block' }}><span className="form-label">Deskripsi</span><textarea className="form-textarea" name="description" rows="3" value={form.description} onChange={updateField} /></label>
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
