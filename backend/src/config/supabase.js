const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Ambil kredensial dari environment variable
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

/**
 * Memeriksa apakah kredensial Supabase sudah dikonfigurasi dengan benar
 */
const isSupabaseConfigured = () => {
    return Boolean(
        supabaseUrl && 
        supabaseUrl !== 'https://your-project-id.supabase.co' &&
        supabaseServiceKey && 
        supabaseServiceKey !== 'your_supabase_service_role_key' &&
        supabaseServiceKey.length > 20
    );
};

let supabase = null;

if (isSupabaseConfigured()) {
    try {
        supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
        console.log('✅ [Supabase] Terhubung ke Supabase Project:', supabaseUrl);
    } catch (err) {
        console.error('❌ [Supabase] Gagal inisialisasi client Supabase:', err.message);
    }
} else {
    console.warn('⚠️  [Supabase] Kredensial di .env belum diisi atau masih berupa placeholder.');
    console.warn('   -> API akan berjalan dalam mode testing/fallback dengan data lokal.');
}

module.exports = {
    supabase,
    isSupabaseConfigured
};
