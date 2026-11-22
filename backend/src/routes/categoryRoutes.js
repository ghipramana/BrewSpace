const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

// GET /api/categories - Ambil semua kategori
router.get('/', CategoryController.getAllCategories);

// GET /api/categories/:id - Ambil detail satu kategori
router.get('/:id', CategoryController.getCategoryById);

module.exports = router;
