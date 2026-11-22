const { supabase, isSupabaseConfigured } = require('../config/supabase');

// Fallback profile untuk pengujian lokal
let fallbackUsers = [
    {
        id: 'u0000000-0000-0000-0000-000000000001',
        email: 'demo@brewspace.com',
        full_name: 'Mahasiswa PPB (Demo User)',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        phone: '081234567890',
        address: 'Jl. Kampus Merdeka No. 12, Jakarta',
        created_at: new Date().toISOString()
    }
];

const UserModel = {
    /**
     * Mengambil data profil user berdasarkan ID
     */
    async getById(id) {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error) return null;
            return data;
        }

        return fallbackUsers.find(u => u.id === id) || fallbackUsers[0];
    },

    /**
     * Memperbarui profil user
     */
    async update(id, updateData) {
        // Kolom yang diizinkan untuk di-update
        const allowedFields = ['full_name', 'phone', 'address', 'avatar_url'];
        const filteredData = {};
        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        }

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('users')
                .update(filteredData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        }

        let user = fallbackUsers.find(u => u.id === id);
        if (!user) {
            user = { id, email: 'user@brewspace.com', ...filteredData };
            fallbackUsers.push(user);
        } else {
            Object.assign(user, filteredData);
        }
        return user;
    }
};

module.exports = UserModel;
