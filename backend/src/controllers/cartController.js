const CartModel = require('../models/cartModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controller untuk mengelola Keranjang Belanja Pengguna
 */
const CartController = {
    /**
     * GET /api/cart
     * Mengambil item di keranjang belanja user beserta kalkulasi total harga
     */
    async getCart(req, res, next) {
        try {
            const userId = req.user.id;
            const items = await CartModel.getByUserId(userId);

            // Hitung subtotal belanja
            let subtotal = 0;
            let totalItems = 0;

            for (const item of items) {
                const itemPrice = item.products ? Number(item.products.price) : 0;
                subtotal += itemPrice * item.quantity;
                totalItems += item.quantity;
            }

            return successResponse(res, {
                items,
                summary: {
                    total_items: totalItems,
                    subtotal,
                    estimated_shipping: subtotal > 0 ? 15000 : 0,
                    grand_total: subtotal > 0 ? subtotal + 15000 : 0
                }
            }, 'Data keranjang belanja berhasil diambil');
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/cart
     * Menambahkan kopi ke keranjang belanja
     */
    async addToCart(req, res, next) {
        try {
            const userId = req.user.id;
            const { product_id, quantity = 1, grind_option = 'Biji Utuh' } = req.body;

            const cartItem = await CartModel.addItem(userId, product_id, Number(quantity), grind_option);
            return successResponse(res, cartItem, 'Produk berhasil ditambahkan ke keranjang', 201);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/cart/:id
     * Memperbarui kuantitas item keranjang
     */
    async updateCartItem(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { quantity } = req.body;

            if (quantity === undefined || typeof quantity !== 'number') {
                return errorResponse(res, 'Quantity harus berupa angka valid', 400);
            }

            const updated = await CartModel.updateQuantity(userId, id, quantity);

            if (!updated) {
                return errorResponse(res, 'Item keranjang tidak ditemukan', 404);
            }

            return successResponse(res, updated, 'Kuantitas keranjang berhasil diperbarui');
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/cart/:id
     * Menghapus item dari keranjang
     */
    async removeCartItem(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const removed = await CartModel.removeItem(userId, id);

            if (!removed) {
                return errorResponse(res, 'Item keranjang tidak ditemukan atau sudah dihapus', 404);
            }

            return successResponse(res, { id }, 'Item keranjang berhasil dihapus');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = CartController;
