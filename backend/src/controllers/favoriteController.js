const FavoriteModel = require('../models/favoriteModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controller untuk mengelola Favorit / Wishlist Kopi Pengguna
 */
const FavoriteController = {
    /**
     * GET /api/favorites
     * Mengambil daftar produk favorit user yang sedang login
     */
    async getFavorites(req, res, next) {
        try {
            const userId = req.user.id;
            const favorites = await FavoriteModel.getByUserId(userId);

            return successResponse(res, favorites, 'Daftar favorit berhasil diambil', 200, {
                total: favorites.length
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/favorites
     * Menambahkan produk ke daftar favorit
     */
    async addFavorite(req, res, next) {
        try {
            const userId = req.user.id;
            const { product_id } = req.body;

            if (!product_id) {
                return errorResponse(res, 'product_id wajib disertakan', 400);
            }

            const favorite = await FavoriteModel.add(userId, product_id);
            return successResponse(res, favorite, 'Produk berhasil ditambahkan ke favorit', 201);
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/favorites/:id
     * Menghapus produk dari daftar favorit (bisa ID relasi atau ID produk)
     */
    async removeFavorite(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const removed = await FavoriteModel.remove(userId, id);

            if (!removed) {
                return errorResponse(res, 'Item favorit tidak ditemukan atau sudah dihapus', 404);
            }

            return successResponse(res, { id }, 'Produk berhasil dihapus dari favorit');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = FavoriteController;
