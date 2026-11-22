const ProductModel = require('../models/productModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controller untuk mengelola Katalog Produk Kopi
 */
const ProductController = {
    /**
     * GET /api/products
     * Mengambil daftar produk kopi dengan dukungan filter, pencarian, dan sortir
     */
    async getAllProducts(req, res, next) {
        try {
            const { category_id, search, sort, is_featured, is_best_seller, limit } = req.query;

            const products = await ProductModel.getAll({
                category_id,
                search,
                sort,
                is_featured,
                is_best_seller,
                limit
            });

            return successResponse(res, products, 'Daftar produk berhasil diambil', 200, {
                total: products.length,
                filters: { category_id, search, sort }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/products/:id
     * Mengambil detail satu produk kopi berdasarkan ID
     */
    async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await ProductModel.getById(id);

            if (!product) {
                return errorResponse(res, `Produk dengan ID ${id} tidak ditemukan`, 404);
            }

            return successResponse(res, product, 'Detail produk berhasil diambil');
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/products
     * Menambahkan produk kopi baru (Membutuhkan data valid)
     */
    async createProduct(req, res, next) {
        try {
            const { name, category_id, origin, price, stock, description, image_url } = req.body;

            if (!name || !price || !image_url) {
                return errorResponse(res, 'Nama, harga, dan gambar produk wajib diisi', 400);
            }

            const newProduct = await ProductModel.create({
                name,
                category_id: category_id || null,
                origin: origin || 'Nusantara',
                price: Number(price),
                stock: stock !== undefined ? Number(stock) : 0,
                description: description || '',
                image_url
            });

            return successResponse(res, newProduct, 'Produk berhasil ditambahkan', 201);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/products/:id
     * Memperbarui informasi produk
     */
    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await ProductModel.update(id, req.body);

            if (!updated) {
                return errorResponse(res, `Produk dengan ID ${id} tidak ditemukan`, 404);
            }

            return successResponse(res, updated, 'Produk berhasil diperbarui');
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/products/:id
     * Menghapus produk dari katalog
     */
    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await ProductModel.delete(id);

            if (!deleted) {
                return errorResponse(res, `Produk dengan ID ${id} tidak ditemukan`, 404);
            }

            return successResponse(res, { id }, 'Produk berhasil dihapus');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = ProductController;
