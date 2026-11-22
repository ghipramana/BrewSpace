const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favoriteController');
const { verifyAuth } = require('../middleware/authMiddleware');

// Semua rute favorit membutuhkan autentikasi
router.use(verifyAuth);

// GET /api/favorites - Ambil semua favorit user
router.get('/', FavoriteController.getFavorites);

// POST /api/favorites - Tambah produk ke favorit
router.post('/', FavoriteController.addFavorite);

// DELETE /api/favorites/:id - Hapus produk dari favorit
router.delete('/:id', FavoriteController.removeFavorite);

module.exports = router;
