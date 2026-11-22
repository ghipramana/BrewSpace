const { supabase, isSupabaseConfigured } = require('../config/supabase');
const ProductModel = require('./productModel');

// In-memory store cart items untuk testing lokal
let fallbackCart = [
    {
        id: 'cart-1',
        user_id: 'u0000000-0000-0000-0000-000000000001',
        product_id: 'a1111111-1111-1111-1111-111111111111',
        quantity: 2,
        grind_option: 'Biji Utuh',
        created_at: new Date().toISOString()
    }
];

const CartModel = {
    /**
     * Mengambil seluruh isi keranjang belanja user
     */
    async getByUserId(userId) {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('cart_items')
                .select(`
                    id,
                    quantity,
                    grind_option,
                    created_at,
                    updated_at,
                    product_id,
                    products (
                        id,
                        name,
                        price,
                        stock,
                        image_url,
                        origin,
                        roast_level
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return data;
        }

        const items = fallbackCart.filter(item => item.user_id === userId);
        const results = [];
        for (const item of items) {
            const product = await ProductModel.getById(item.product_id);
            if (product) {
                results.push({
                    id: item.id,
                    quantity: item.quantity,
                    grind_option: item.grind_option,
                    created_at: item.created_at,
                    product_id: item.product_id,
                    products: product
                });
            }
        }
        return results;
    },

    /**
     * Menambahkan produk ke keranjang (atau update kuantitas jika opsi gilingan sama)
     */
    async addItem(userId, productId, quantity = 1, grindOption = 'Biji Utuh') {
        if (isSupabaseConfigured() && supabase) {
            // Cek apakah item dengan gilingan yang sama sudah ada di keranjang
            const { data: existing } = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('user_id', userId)
                .eq('product_id', productId)
                .eq('grind_option', grindOption)
                .maybeSingle();

            if (existing) {
                const newQty = existing.quantity + quantity;
                const { data, error } = await supabase
                    .from('cart_items')
                    .update({ quantity: newQty })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw new Error(error.message);
                return data;
            }

            // Insert baru
            const { data, error } = await supabase
                .from('cart_items')
                .insert([{
                    user_id: userId,
                    product_id: productId,
                    quantity,
                    grind_option: grindOption
                }])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        }

        const existing = fallbackCart.find(
            c => c.user_id === userId && c.product_id === productId && c.grind_option === grindOption
        );

        if (existing) {
            existing.quantity += quantity;
            return existing;
        }

        const newItem = {
            id: 'cart-' + Date.now(),
            user_id: userId,
            product_id: productId,
            quantity,
            grind_option: grindOption,
            created_at: new Date().toISOString()
        };
        fallbackCart.push(newItem);
        return newItem;
    },

    /**
     * Mengubah jumlah kuantitas item di keranjang
     */
    async updateQuantity(userId, cartItemId, quantity) {
        if (quantity < 1) {
            return this.removeItem(userId, cartItemId);
        }

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('id', cartItemId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        }

        const item = fallbackCart.find(c => c.id === cartItemId && c.user_id === userId);
        if (item) {
            item.quantity = quantity;
            return item;
        }
        return null;
    },

    /**
     * Menghapus item dari keranjang
     */
    async removeItem(userId, cartItemId) {
        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', cartItemId)
                .eq('user_id', userId);

            if (error) throw new Error(error.message);
            return true;
        }

        const initLen = fallbackCart.length;
        fallbackCart = fallbackCart.filter(c => !(c.id === cartItemId && c.user_id === userId));
        return fallbackCart.length < initLen;
    },

    /**
     * Mengosongkan keranjang setelah checkout sukses
     */
    async clearCart(userId) {
        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', userId);

            if (error) throw new Error(error.message);
            return true;
        }

        fallbackCart = fallbackCart.filter(c => c.user_id !== userId);
        return true;
    }
};

module.exports = CartModel;
