const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controller untuk mengelola Transaksi & Riwayat Pesanan
 */
const OrderController = {
    /**
     * GET /api/orders
     * Mengambil seluruh riwayat pesanan milik user
     */
    async getOrders(req, res, next) {
        try {
            const userId = req.user.id;
            const orders = await OrderModel.getByUserId(userId);

            return successResponse(res, orders, 'Daftar riwayat pesanan berhasil diambil', 200, {
                total: orders.length
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/orders/:id
     * Mengambil rincian satu pesanan tertentu
     */
    async getOrderById(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const order = await OrderModel.getById(id, userId);

            if (!order) {
                return errorResponse(res, `Pesanan dengan ID ${id} tidak ditemukan`, 404);
            }

            return successResponse(res, order, 'Detail pesanan berhasil diambil');
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/orders
     * Membuat pesanan baru (Simulasi Checkout dari Keranjang atau Beli Langsung)
     */
    async createOrder(req, res, next) {
        try {
            const userId = req.user.id;
            const { shipping_address, shipping_phone, payment_method, notes, items: directItems } = req.body;

            let itemsToOrder = [];
            let totalAmount = 0;

            // 1. Jika dikirim items langsung (misal fitur "Beli Sekarang")
            if (directItems && Array.isArray(directItems) && directItems.length > 0) {
                itemsToOrder = directItems;
                totalAmount = itemsToOrder.reduce((sum, i) => sum + (Number(i.price) * Number(i.quantity)), 0);
            } else {
                // 2. Ambil dari keranjang belanja user
                const cartItems = await CartModel.getByUserId(userId);

                if (!cartItems || cartItems.length === 0) {
                    return errorResponse(res, 'Keranjang belanja Anda masih kosong. Pilih kopi favorit Anda terlebih dahulu.', 400);
                }

                itemsToOrder = cartItems.map(ci => ({
                    product_id: ci.product_id,
                    product_name: ci.products?.name || 'Kopi Pilihan BrewSpace',
                    price: Number(ci.products?.price || 0),
                    quantity: ci.quantity,
                    grind_option: ci.grind_option
                }));

                totalAmount = itemsToOrder.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            }

            // Tambahkan estimasi ongkos kirim standar (Rp 15.000)
            const shippingFee = 15000;
            const grandTotal = totalAmount + shippingFee;

            const newOrder = await OrderModel.createOrder({
                userId,
                totalAmount: grandTotal,
                shippingAddress: shipping_address,
                shippingPhone: shipping_phone,
                paymentMethod: payment_method || 'Transfer Bank (Simulasi)',
                notes: notes || '',
                items: itemsToOrder
            });

            return successResponse(res, newOrder, 'Pesanan berhasil dibuat! Terima kasih telah memesan di BrewSpace.', 201);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/orders/:id/status
     * Memperbarui status pesanan (Pending, Diproses, Dikirim, Selesai, Dibatalkan)
     */
    async updateOrderStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['Pending', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
            if (!status || !validStatuses.includes(status)) {
                return errorResponse(res, `Status harus salah satu dari: ${validStatuses.join(', ')}`, 400);
            }

            const updatedOrder = await OrderModel.updateStatus(id, status);

            if (!updatedOrder) {
                return errorResponse(res, `Pesanan dengan ID ${id} tidak ditemukan`, 404);
            }

            return successResponse(res, updatedOrder, `Status pesanan berhasil diubah menjadi ${status}`);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = OrderController;
