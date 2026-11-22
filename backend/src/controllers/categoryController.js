const CategoryModel = require('../models/categoryModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controller untuk mengelola Kategori Produk Kopi
 */
const CategoryController = {
    /**
     * GET /api/categories
     * Mengambil seluruh daftar kategori
     */
    async getAllCategories(req, res, next) {
        try {
            const categories = await CategoryModel.getAll();
            return successResponse(res, categories, 'Daftar kategori berhasil diambil');
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/categories/:id
     * Mengambil detail satu kategori
     */
    async getCategoryById(req, res, next) {
        try {
            const { id } = req.params;
            const category = await CategoryModel.getById(id);

            if (!category) {
                return errorResponse(res, `Kategori dengan ID ${id} tidak ditemukan`, 404);
            }

            return successResponse(res, category, 'Detail kategori berhasil diambil');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = CategoryController;
