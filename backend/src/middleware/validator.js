const { errorResponse } = require('../utils/responseFormatter');

/**
 * Validasi request body untuk penambahan item ke keranjang
 */
const validateAddToCart = (req, res, next) => {
    const { product_id, quantity, grind_option } = req.body;

    const errors = [];
    if (!product_id) errors.push('product_id wajib diisi');
    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 1)) {
        errors.push('quantity harus berupa angka minimal 1');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Validasi data gagal', 400, errors);
    }

    next();
};

/**
 * Validasi request body saat checkout pesanan
 */
const validateCheckout = (req, res, next) => {
    const { shipping_address, shipping_phone, payment_method } = req.body;

    const errors = [];
    if (!shipping_address || typeof shipping_address !== 'string' || shipping_address.trim().length < 5) {
        errors.push('Alamat pengiriman lengkap wajib diisi minimal 5 karakter');
    }
    if (!shipping_phone || typeof shipping_phone !== 'string' || shipping_phone.trim().length < 8) {
        errors.push('Nomor telepon pengiriman yang valid wajib diisi');
    }
    if (!payment_method) {
        errors.push('Metode pembayaran simulasi wajib dipilih');
    }

    if (errors.length > 0) {
        return errorResponse(res, 'Validasi data checkout gagal', 400, errors);
    }

    next();
};

module.exports = {
    validateAddToCart,
    validateCheckout
};
