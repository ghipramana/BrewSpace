import { supabaseClient } from './authService';
import { fallbackCategories, fallbackProducts } from './mockData';

const PRODUCT_IMAGE_BUCKET = 'product-images';
const ok = (data) => ({ success: true, data });
const isInstantCoffee = (item) => {
  const labels = [item.name, item.slug, item.categories?.name, item.categories?.slug]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return Number(item.category_id ?? item.id) === 3 || /instan|instant/.test(labels);
};
const ensureData = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};

const currentUser = async () => {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session?.user || null;
};

const stored = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const getLocalProducts = () => {
  const products = stored('brewspace_local_products', fallbackProducts);
  return products.filter((product) => !isInstantCoffee(product));
};

export const uploadProductImage = async (file) => {
  if (!supabaseClient) throw new Error('Supabase belum dikonfigurasi. Upload gambar perlu Supabase Storage.');
  if (!file?.type?.startsWith('image/')) throw new Error('Pilih file gambar yang valid.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 5 MB.');

  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabaseClient.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false
  });
  if (error) {
    if (error.message.toLowerCase().includes('bucket')) {
      throw new Error('Bucket product-images belum disiapkan di Supabase. Jalankan SQL setup Storage.');
    }
    throw new Error(`Gagal mengunggah gambar: ${error.message}`);
  }
  return supabaseClient.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
};

// Kategori dan katalog
export const getCategories = async () => {
  if (!supabaseClient) return ok(fallbackCategories);
  const data = ensureData(await supabaseClient.from('categories').select('*').order('id'));
  return ok(data.filter((category) => !isInstantCoffee(category)));
};

export const getCategoryById = async (id) => {
  if (!supabaseClient) return ok(fallbackCategories.find((category) => category.id === Number(id)) || fallbackCategories[0]);
  return ok(ensureData(await supabaseClient.from('categories').select('*').eq('id', id).single()));
};

export const getProducts = async (params = {}) => {
  if (!supabaseClient) {
    let data = [...getLocalProducts()];
    if (params.category_id) data = data.filter((product) => Number(product.category_id) === Number(params.category_id));
    if (params.is_best_seller) data = data.filter((product) => product.is_best_seller);
    if (params.is_featured) data = data.filter((product) => product.is_featured);
    if (params.search) {
      const query = params.search.toLowerCase();
      data = data.filter((product) => product.name.toLowerCase().includes(query) || product.origin?.toLowerCase().includes(query));
    }
    if (params.sort === 'price_asc') data.sort((a, b) => a.price - b.price);
    if (params.sort === 'price_desc') data.sort((a, b) => b.price - a.price);
    if (params.limit) data = data.slice(0, Number(params.limit));
    return ok(data);
  }

  let query = supabaseClient.from('products').select('*, categories(id, name, slug)');
  if (params.category_id) query = query.eq('category_id', params.category_id);
  if (params.is_best_seller !== undefined) query = query.eq('is_best_seller', Boolean(params.is_best_seller));
  if (params.is_featured !== undefined) query = query.eq('is_featured', Boolean(params.is_featured));
  if (params.search) query = query.or(`name.ilike.%${params.search}%,origin.ilike.%${params.search}%`);
  if (params.sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (params.sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });
  if (params.limit) query = query.limit(Number(params.limit));
  return ok(ensureData(await query).filter((product) => !isInstantCoffee(product)));
};

export const getProductById = async (id) => {
  if (!supabaseClient) return ok(getLocalProducts().find((product) => product.id === id) || getLocalProducts()[0]);
  return ok(ensureData(await supabaseClient.from('products').select('*, categories(id, name, slug, description)').eq('id', id).single()));
};

export const createProduct = async (productData) => {
  if (!supabaseClient) {
    const products = getLocalProducts();
    const category = fallbackCategories.find((item) => item.id === Number(productData.category_id)) || fallbackCategories[0];
    const product = { id: `p-${Date.now()}`, ...productData, category_id: Number(productData.category_id), categories: category, created_at: new Date().toISOString() };
    products.unshift(product);
    save('brewspace_local_products', products);
    return ok(product);
  }
  return ok(ensureData(await supabaseClient.from('products').insert(productData).select('*, categories(id, name, slug)').single()));
};

export const updateProduct = async (id, updateData) => {
  if (!supabaseClient) {
    const products = getLocalProducts();
    const index = products.findIndex((product) => product.id === id);
    if (index < 0) throw new Error('Produk tidak ditemukan.');
    products[index] = { ...products[index], ...updateData };
    save('brewspace_local_products', products);
    return ok(products[index]);
  }
  return ok(ensureData(await supabaseClient.from('products').update(updateData).eq('id', id).select('*, categories(id, name, slug)').single()));
};

export const deleteProduct = async (id) => {
  if (!supabaseClient) {
    save('brewspace_local_products', getLocalProducts().filter((product) => product.id !== id));
    return { success: true };
  }
  ensureData(await supabaseClient.from('products').delete().eq('id', id));
  return { success: true };
};

// Keranjang
const localCart = () => stored('brewspace_local_cart', []);
const localCartSummary = (items) => {
  const subtotal = items.reduce((sum, item) => sum + Number(item.products?.price || 0) * item.quantity, 0);
  return { total_items: items.reduce((sum, item) => sum + item.quantity, 0), subtotal, estimated_shipping: subtotal ? 15000 : 0, grand_total: subtotal ? subtotal + 15000 : 0 };
};

export const getCart = async () => {
  const user = await currentUser();
  if (!user) {
    const items = localCart();
    return ok({ items, summary: localCartSummary(items) });
  }
  const items = ensureData(await supabaseClient.from('cart_items')
    .select('id, quantity, grind_option, created_at, product_id, products(id, name, price, stock, image_url, origin)')
    .eq('user_id', user.id).order('created_at', { ascending: false }));
  return ok({ items, summary: localCartSummary(items) });
};

export const addToCart = async (productId, quantity = 1, grindOption = 'Biji Utuh') => {
  const user = await currentUser();
  if (!user) {
    const items = localCart();
    const product = getLocalProducts().find((item) => item.id === productId) || getLocalProducts()[0];
    const existing = items.find((item) => item.product_id === productId && item.grind_option === grindOption);
    if (existing) existing.quantity += quantity;
    else items.push({ id: `cart-${Date.now()}`, product_id: productId, quantity, grind_option: grindOption, products: product });
    save('brewspace_local_cart', items);
    return { success: true };
  }
  const table = supabaseClient.from('cart_items');
  const existing = ensureData(await table.select('id, quantity').eq('user_id', user.id).eq('product_id', productId).eq('grind_option', grindOption).maybeSingle());
  if (existing) return ok(ensureData(await table.update({ quantity: existing.quantity + quantity }).eq('id', existing.id).select().single()));
  return ok(ensureData(await table.insert({ user_id: user.id, product_id: productId, quantity, grind_option: grindOption }).select().single()));
};

export const updateCartItem = async (cartItemId, quantity) => {
  const user = await currentUser();
  if (!user) {
    const items = localCart();
    save('brewspace_local_cart', quantity < 1 ? items.filter((item) => item.id !== cartItemId) : items.map((item) => item.id === cartItemId ? { ...item, quantity } : item));
    return { success: true };
  }
  if (quantity < 1) return removeCartItem(cartItemId);
  return ok(ensureData(await supabaseClient.from('cart_items').update({ quantity }).eq('id', cartItemId).eq('user_id', user.id).select().single()));
};

export const removeCartItem = async (cartItemId) => {
  const user = await currentUser();
  if (!user) {
    save('brewspace_local_cart', localCart().filter((item) => item.id !== cartItemId));
    return { success: true };
  }
  ensureData(await supabaseClient.from('cart_items').delete().eq('id', cartItemId).eq('user_id', user.id));
  return { success: true };
};

// Favorit
export const getFavorites = async () => {
  const user = await currentUser();
  if (!user) {
    const ids = stored('brewspace_local_favs', []);
    return ok(getLocalProducts().filter((product) => ids.includes(product.id)).map((products) => ({ id: `fav-${products.id}`, product_id: products.id, products })));
  }
  return ok(ensureData(await supabaseClient.from('favorites')
    .select('id, created_at, product_id, products(id, name, origin, price, stock, image_url, category_id, categories(id, name, slug))')
    .eq('user_id', user.id).order('created_at', { ascending: false })));
};

export const addFavorite = async (productId) => {
  const user = await currentUser();
  if (!user) {
    const ids = stored('brewspace_local_favs', []);
    if (!ids.includes(productId)) ids.push(productId);
    save('brewspace_local_favs', ids);
    return { success: true };
  }
  const { error } = await supabaseClient.from('favorites').insert({ user_id: user.id, product_id: productId });
  if (error && error.code !== '23505') throw new Error(error.message);
  return { success: true };
};

export const removeFavorite = async (identifier) => {
  const user = await currentUser();
  if (!user) {
    save('brewspace_local_favs', stored('brewspace_local_favs', []).filter((id) => id !== identifier));
    return { success: true };
  }
  ensureData(await supabaseClient.from('favorites').delete().eq('user_id', user.id).or(`id.eq.${identifier},product_id.eq.${identifier}`));
  return { success: true };
};

// Pesanan
const localOrders = () => stored('brewspace_local_orders', []);
export const getOrders = async () => {
  const user = await currentUser();
  if (!user) return ok(localOrders());
  return ok(ensureData(await supabaseClient.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false })));
};

export const getOrderById = async (id) => {
  const user = await currentUser();
  if (!user) return ok(localOrders().find((order) => order.id === id) || null);
  return ok(ensureData(await supabaseClient.from('orders').select('*, order_items(*)').eq('id', id).eq('user_id', user.id).single()));
};

export const getAdminOrders = async () => {
  if (!supabaseClient) throw new Error('Data pesanan admin membutuhkan koneksi Supabase.');
  const orders = ensureData(await supabaseClient
    .from('orders')
    .select('*, order_items(id, product_name, quantity, subtotal)')
    .order('created_at', { ascending: false })
    .limit(100));
  const userIds = [...new Set(orders.map((order) => order.user_id).filter(Boolean))];
  const profiles = userIds.length
    ? ensureData(await supabaseClient.from('users').select('id, full_name, email').in('id', userIds))
    : [];
  const profileById = Object.fromEntries(profiles.map((profile) => [profile.id, profile]));
  return ok(orders.map((order) => ({ ...order, customer: profileById[order.user_id] || null })));
};

export const getAdminCustomers = async () => {
  if (!supabaseClient) throw new Error('Data pelanggan admin membutuhkan koneksi Supabase.');
  return ok(ensureData(await supabaseClient
    .from('users')
    .select('id, email, full_name, phone, created_at')
    .order('created_at', { ascending: false })));
};

export const checkoutOrder = async (payload) => {
  if (!supabaseClient) throw new Error('Checkout membutuhkan koneksi Supabase agar stok dan pesanan tersimpan dengan benar.');
  const user = await currentUser();
  if (!user) throw new Error('Masuk ke akun sebelum membuat pesanan.');
  let items = payload.items;
  if (!items?.length) {
    const cart = await getCart();
    items = cart.data.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.products?.name || 'Kopi BrewSpace',
      price: Number(item.products?.price || 0),
      quantity: item.quantity,
      grind_option: item.grind_option
    }));
  }
  if (!items.length) throw new Error('Keranjang belanja masih kosong.');

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const orderNumber = `BS-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderItems = items.map((item) => ({
    product_id: item.product_id,
    quantity: Number(item.quantity),
    grind_option: item.grind_option || 'Biji Utuh'
  }));
  const order = ensureData(await supabaseClient.rpc('checkout_order', {
    p_order_number: orderNumber,
    p_shipping_address: payload.shipping_address,
    p_shipping_phone: payload.shipping_phone,
    p_payment_method: payload.payment_method || 'QRIS',
    p_notes: payload.notes || null,
    p_items: orderItems,
    p_clear_cart: !payload.items?.length
  }));
  return ok(order);
};

// Profil pengguna
export const getUserProfile = async (userId) => {
  const cached = stored(`brewspace_profile_${userId}`, {});
  const user = await currentUser();
  if (!user || user.id !== userId) {
    const localUser = stored('brewspace_user', {});
    return ok({ ...localUser, ...cached });
  }
  const { data, error } = await supabaseClient.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  const profile = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    phone: '',
    address: '',
    ...data,
    ...cached
  };
  save(`brewspace_profile_${userId}`, profile);
  return ok(profile);
};

export const updateUserProfile = async (userId, payload) => {
  const user = await currentUser();
  const cached = { ...stored(`brewspace_profile_${userId}`, {}), ...payload };
  if (!user || user.id !== userId) {
    save(`brewspace_profile_${userId}`, cached);
    return ok(cached);
  }
  const { data, error } = await supabaseClient.from('users').update(payload).eq('id', userId).select().single();
  if (error) throw new Error(error.message);
  save(`brewspace_profile_${userId}`, { ...data, ...payload });
  return ok({ ...data, ...payload });
};

export default supabaseClient;
