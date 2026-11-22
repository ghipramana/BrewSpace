const { supabase, isSupabaseConfigured } = require('../config/supabase');

// Mock data kategori dari seed.sql untuk fallback jika Supabase belum disetup
const fallbackCategories = [
    { id: 1, name: 'Biji Kopi', slug: 'biji-kopi', description: 'Biji kopi sangrai pilihan (whole beans) dari berbagai pegunungan terbaik Indonesia.', icon_name: 'Bean' },
    { id: 2, name: 'Kopi Bubuk', slug: 'kopi-bubuk', description: 'Kopi giling siap seduh dengan tingkat kehalusan presisi untuk manual brew atau tubruk.', icon_name: 'Coffee' },
    { id: 3, name: 'Kopi Instan & Drip', slug: 'kopi-instan-drip', description: 'Praktis dan higienis, drip bag premium dan bubuk instan siap seduh di mana saja.', icon_name: 'Package' },
    { id: 4, name: 'Minuman Siap Minum', slug: 'minuman-siap-minum', description: 'Cold brew segar dan signature latte kemasan botol siap dinikmati kapan saja.', icon_name: 'CupSoda' }
];

const CategoryModel = {
    /**
     * Mengambil seluruh kategori produk
     */
    async getAll() {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw new Error(error.message);
            return data;
        }

        return fallbackCategories;
    },

    /**
     * Mengambil kategori berdasarkan ID
     */
    async getById(id) {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('id', id)
                .single();

            if (error) return null;
            return data;
        }

        return fallbackCategories.find(c => c.id === parseInt(id, 10)) || null;
    }
};

module.exports = CategoryModel;
