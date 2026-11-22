const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Middleware untuk memverifikasi Supabase JWT Bearer Token
 * Digunakan pada endpoint yang membutuhkan hak akses pengguna (Keranjang, Favorit, Pesanan, Profil)
 */
const verifyAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Akses ditolak: Token otentikasi tidak ditemukan. Silakan login terlebih dahulu.', 401);
        }

        const token = authHeader.split(' ')[1];

        // 1. Jika Supabase terhubung, verifikasi token secara resmi lewat Supabase Auth API
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.auth.getUser(token);

            if (error || !data.user) {
                return errorResponse(res, 'Sesi tidak valid atau telah kadaluarsa. Silakan login kembali.', 401, error?.message);
            }

            // Simpan data user ke request context
            req.user = data.user;
            return next();
        }

        // 2. Mode Pengembangan / Testing Mandiri (Jika Supabase belum disetup di .env)
        if (token.startsWith('demo-') || token === 'test-token' || process.env.NODE_ENV === 'development') {
            req.user = {
                id: req.headers['x-mock-user-id'] || 'u0000000-0000-0000-0000-000000000001',
                email: 'demo@brewspace.com',
                user_metadata: {
                    full_name: 'Mahasiswa PPB (Demo User)'
                }
            };
            return next();
        }

        return errorResponse(res, 'Token tidak dikenali.', 401);
    } catch (err) {
        return errorResponse(res, 'Terjadi kesalahan saat memverifikasi otentikasi.', 500, err.message);
    }
};

/**
 * Middleware opsional: Cek token jika ada, tapi tidak blokir jika tidak ada token
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];
        if (isSupabaseConfigured() && supabase) {
            const { data } = await supabase.auth.getUser(token);
            req.user = data?.user || null;
        } else {
            req.user = {
                id: req.headers['x-mock-user-id'] || 'u0000000-0000-0000-0000-000000000001',
                email: 'demo@brewspace.com'
            };
        }
        next();
    } catch {
        req.user = null;
        next();
    }
};

module.exports = {
    verifyAuth,
    optionalAuth
};
