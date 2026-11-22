const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// GET /api/products - Ambil daftar produk dengan filter dan search
router.get('/', ProductController.getAllProducts);

// GET /api/products/:id - Ambil detail satu produk
router.get('/:id', ProductController.getProductById);

// POST /api/products - Tambah produk baru
router.post('/', ProductController.createProduct);

// PUT /api/products/:id - Perbarui data produk
router.put('/:id', ProductController.updateProduct);

// DELETE /api/products/:id - Hapus produk
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
