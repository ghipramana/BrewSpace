const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { verifyAuth } = require('../middleware/authMiddleware');

// Verifikasi token user
router.use(verifyAuth);

// GET /api/users/:id - Ambil data profil pengguna
router.get('/:id', UserController.getUserProfile);

// PUT /api/users/:id - Update data profil pengguna
router.put('/:id', UserController.updateUserProfile);

module.exports = router;
