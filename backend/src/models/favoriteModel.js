const { supabase, isSupabaseConfigured } = require('../config/supabase');
const ProductModel = require('./productModel');

// In-memory store untuk favorites jika mode fallback
let fallbackFavorites = [
    { id: 'fav-1', user_id: 'u0000000-0000-0000-0000-000000000001', product_id: 'a1111111-1111-1111-1111-111111111111', created_at: new Date().toISOString() },
    { id: 'fav-2', user_id: 'u0000000-0000-0000-0000-000000000001', product_id: 'd2222222-2222-2222-2222-222222222222', created_at: new Date().toISOString() }
];

const FavoriteModel = {
    /**
     * Mengambil daftar produk favorit seorang user
     */
    async getByUserId(userId) {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('favorites')
                .select(`
                    id,
                    created_at,
                    product_id,
                    products (
                        id,
                        name,
                        origin,
                        price,
                        stock,
                        image_url,
                        category_id,
                        categories (id, name, slug)
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return data;
        }

        const userFavs = fallbackFavorites.filter(f => f.user_id === userId);
        const results = [];
        for (const fav of userFavs) {
            const product = await ProductModel.getById(fav.product_id);
            if (product) {
                results.push({
                    id: fav.id,
                    created_at: fav.created_at,
                    product_id: fav.product_id,
                    products: product
                });
            }
        }
        return results;
    },

    /**
     * Menambahkan produk ke favorit
     */
    async add(userId, productId) {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('favorites')
                .insert([{ user_id: userId, product_id: productId }])
                .select()
                .single();

            if (error) {
                // Abaikan jika sudah ada (duplicate key)
                if (error.code === '23505') {
                    return { message: 'Produk sudah ada di favorit' };
                }
                throw new Error(error.message);
            }
            return data;
        }

        const exists = fallbackFavorites.some(f => f.user_id === userId && f.product_id === productId);
        if (!exists) {
            const newFav = {
                id: 'fav-' + Date.now(),
                user_id: userId,
                product_id: productId,
                created_at: new Date().toISOString()
            };
            fallbackFavorites.push(newFav);
            return newFav;
        }
        return { message: 'Produk sudah ada di favorit' };
    },

    /**
     * Menghapus produk dari favorit (bisa lewat id favorit atau product_id)
     */
    async remove(userId, identifier) {
        if (isSupabaseConfigured() && supabase) {
            // Cek apakah identifier adalah favorite ID atau product ID
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .or(`id.eq.${identifier},product_id.eq.${identifier}`);

            if (error) throw new Error(error.message);
            return true;
        }

        const initialLen = fallbackFavorites.length;
        fallbackFavorites = fallbackFavorites.filter(
            f => !(f.user_id === userId && (f.id === identifier || f.product_id === identifier))
        );
        return fallbackFavorites.length < initialLen;
    },

    /**
     * Memeriksa apakah suatu produk ada di favorit user
     */
    async checkIsFavorite(userId, productId) {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', userId)
                .eq('product_id', productId)
                .maybeSingle();

            if (error) return false;
            return Boolean(data);
        }

        return fallbackFavorites.some(f => f.user_id === userId && f.product_id === productId);
    }
};

module.exports = FavoriteModel;
