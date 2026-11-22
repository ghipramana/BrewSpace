const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { verifyAuth } = require('../middleware/authMiddleware');
const { validateAddToCart } = require('../middleware/validator');

// Semua rute keranjang membutuhkan otentikasi user
router.use(verifyAuth);

// GET /api/cart - Ambil isi keranjang belanja user
router.get('/', CartController.getCart);

// POST /api/cart - Tambah item ke keranjang
router.post('/', validateAddToCart, CartController.addToCart);

// PUT /api/cart/:id - Ubah kuantitas item
router.put('/:id', CartController.updateCartItem);

// DELETE /api/cart/:id - Hapus item dari keranjang
router.delete('/:id', CartController.removeCartItem);

module.exports = router;
