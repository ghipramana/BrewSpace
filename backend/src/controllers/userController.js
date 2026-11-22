const UserModel = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controller untuk mengelola Data Profil Pengguna
 */
const UserController = {
    /**
     * GET /api/users/:id
     * Mengambil data profil pengguna
     */
    async getUserProfile(req, res, next) {
        try {
            const { id } = req.params;
            const profile = await UserModel.getById(id);

            if (!profile) {
                return errorResponse(res, `Pengguna dengan ID ${id} tidak ditemukan`, 404);
            }

            return successResponse(res, profile, 'Profil pengguna berhasil diambil');
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/users/:id
     * Memperbarui profil pengguna (nama, telepon, alamat, avatar)
     */
    async updateUserProfile(req, res, next) {
        try {
            const { id } = req.params;

            // Pastikan user hanya dapat mengubah profilnya sendiri (atau via token terverifikasi)
            if (req.user && req.user.id !== id && process.env.NODE_ENV === 'production') {
                return errorResponse(res, 'Anda tidak memiliki hak untuk mengubah profil pengguna lain', 403);
            }

            const updatedProfile = await UserModel.update(id, req.body);

            return successResponse(res, updatedProfile, 'Profil pengguna berhasil diperbarui');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = UserController;
