const { supabase, isSupabaseConfigured } = require('../config/supabase');

// Data fallback produk sesuai seed.sql
let fallbackProducts = [
    {
        id: 'a1111111-1111-1111-1111-111111111111',
        category_id: 1,
        name: 'Arabica Aceh Gayo Specialty 250g',
        origin: 'Aceh Gayo, Sumatera',
        price: 85000,
        stock: 35,
        description: 'Biji kopi Arabica murni dari dataran tinggi Takengon, Aceh Gayo pada ketinggian 1.400 mdpl. Menghasilkan aroma rempah herbal yang khas, keasaman lembut (medium-low acidity), dan aftertaste cokelat karamel yang bersih dan manis seimbang.',
        image_url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80',
        is_featured: true,
        is_best_seller: true,
        categories: { id: 1, name: 'Biji Kopi', slug: 'biji-kopi' }
    },
    {
        id: 'a2222222-2222-2222-2222-222222222222',
        category_id: 1,
        name: 'Robusta Lampung Gold Roast 250g',
        origin: 'Lampung Barat, Sumatera',
        price: 52000,
        stock: 50,
        description: 'Biji kopi Robusta petik merah pilihan dari lereng pegunungan Lampung. Karakteristik rasa tebal (full body), aroma nutty panggang yang kuat, minim asam, dan krema yang tebal. Pilihan sempurna untuk campuran espresso dan es kopi susu kekinian.',
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
        is_featured: false,
        is_best_seller: true,
        categories: { id: 1, name: 'Biji Kopi', slug: 'biji-kopi' }
    },
    {
        id: 'a3333333-3333-3333-3333-333333333333',
        category_id: 1,
        name: 'Arabica Toraja Sapan Grade 1 200g',
        origin: 'Toraja Utara, Sulawesi',
        price: 95000,
        stock: 28,
        description: 'Kopi legendaris dari dataran tinggi Sapan, Toraja. Memiliki profil rasa yang kompleks dengan sentuhan dark cocoa, rempah kayu manis, serta keasaman buah ripe fruit yang elegan. Disangrai dengan presisi untuk menonjolkan aroma eksotis khas tanah Toraja.',
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        is_featured: true,
        is_best_seller: false,
        categories: { id: 1, name: 'Biji Kopi', slug: 'biji-kopi' }
    },
    {
        id: 'a4444444-4444-4444-4444-444444444444',
        category_id: 1,
        name: 'Arabica Bali Kintamani Natural 200g',
        origin: 'Kintamani, Bali',
        price: 89000,
        stock: 20,
        description: 'Ditanam berdampingan dengan pohon jeruk purut di tanah vulkanik Gunung Batur. Mengusung proses natural anaerobik yang menghasilkan aroma citrus menyegarkan, notes buah beri merah, rasa manis madu, dan body yang ringan dan segar.',
        image_url: 'https://images.unsplash.com/photo-1610632380989-680fe40816c6?auto=format&fit=crop&w=600&q=80',
        is_featured: true,
        is_best_seller: false,
        categories: { id: 1, name: 'Biji Kopi', slug: 'biji-kopi' }
    },
    {
        id: 'a5555555-5555-5555-5555-555555555555',
        category_id: 1,
        name: 'Arabica Flores Bajawa Organic 250g',
        origin: 'Ngada, Flores, NTT',
        price: 88000,
        stock: 30,
        description: 'Dihasilkan dari perkebunan organik lereng Gunung Inerie Flores. Memiliki keunikan notes tembakau manis, cokelat hitam pekat, dan keasaman vanila yang lembut. Sangat nikmat diseduh menggunakan metode V60 atau Aeropress.',
        image_url: 'https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?auto=format&fit=crop&w=600&q=80',
        is_featured: false,
        is_best_seller: false,
        categories: { id: 1, name: 'Biji Kopi', slug: 'biji-kopi' }
    },
    {
        id: 'a6666666-6666-6666-6666-666666666666',
        category_id: 1,
        name: 'House Blend Espresso Nusantara 500g',
        origin: 'Multi-Origin Blend',
        price: 115000,
        stock: 40,
        description: 'Racikan signature BrewSpace: perpaduan 70% Arabica Gayo & Toraja dengan 30% Robusta Lampung premium. Dirancang khusus untuk menghasilkan espresso dengan crema keemasan yang stabil, notes dark chocolate, dan hint hazelnut yang berpadu sempurna dengan susu.',
        image_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80',
        is_featured: true,
        is_best_seller: true,
        categories: { id: 1, name: 'Biji Kopi', slug: 'biji-kopi' }
    },
    {
        id: 'b1111111-1111-1111-1111-111111111111',
        category_id: 2,
        name: 'Kopi Bubuk Tubruk Gayo Tradisional 200g',
        origin: 'Aceh Gayo, Sumatera',
        price: 48000,
        stock: 45,
        description: 'Kopi bubuk giling halus siap seduh untuk penikmat kopi tubruk sejati. Menghadirkan kenikmatan aroma pekat dengan serbuk kopi yang cepat mengendap di dasar cangkir, menyisakan seduhan kopi hitam manis alami yang mantap.',
        image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
        is_featured: false,
        is_best_seller: true,
        categories: { id: 2, name: 'Kopi Bubuk', slug: 'kopi-bubuk' }
    },
    {
        id: 'b2222222-2222-2222-2222-222222222222',
        category_id: 2,
        name: 'Kopi Bubuk Sidikalang Robusta 250g',
        origin: 'Dairi, Sumatera Utara',
        price: 45000,
        stock: 60,
        description: 'Kopi bubuk legendaris dari tanah Sidikalang yang terkenal dengan kekuatan kafein dan aroma smoky khasnya. Sangat cocok dinikmati di pagi hari untuk mendongkrak konsentrasi kerja.',
        image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80',
        is_featured: false,
        is_best_seller: false,
        categories: { id: 2, name: 'Kopi Bubuk', slug: 'kopi-bubuk' }
    },
    {
        id: 'b3333333-3333-3333-3333-333333333333',
        category_id: 2,
        name: 'Fine Grind Moka Pot & Espresso Blend 200g',
        origin: 'Blend Jawa & Sumatera',
        price: 60000,
        stock: 25,
        description: 'Bubuk kopi dengan tingkat kehalusan presisi untuk mesin espresso rumahan atau Moka Pot. Menghasilkan ekstraksi optimal tanpa rasa gosong atau ampas berlebih.',
        image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
        is_featured: false,
        is_best_seller: false,
        categories: { id: 2, name: 'Kopi Bubuk', slug: 'kopi-bubuk' }
    },
    {
        id: 'd1111111-1111-1111-1111-111111111111',
        category_id: 4,
        name: 'Cold Brew Classic Black Bottle 250ml',
        origin: 'House Blend Single Origin',
        price: 28000,
        stock: 25,
        description: 'Kopi konsentrat hitam yang diekstraksi dingin selama 16 jam penuh menggunakan air es bersuhu terkontrol. Rendah asam, sangat ramah di lambung, dan kaya akan cita rasa karamel alami. Siap diminum langsung dalam botol dingin.',
        image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
        is_featured: true,
        is_best_seller: true,
        categories: { id: 4, name: 'Minuman Siap Minum', slug: 'minuman-siap-minum' }
    },
    {
        id: 'd2222222-2222-2222-2222-222222222222',
        category_id: 4,
        name: 'Signature Kopi Susu Aren 250ml',
        origin: 'Espresso Blend & Aren Organik',
        price: 24000,
        stock: 50,
        description: 'Minuman terlaris di gerai BrewSpace! Perpaduan double shot espresso Nusantara, fresh milk berkualitas tinggi, dan sirup gula aren murni organik asal Lebak Banten. Manis legit berpadu rasa gurih dan wangi kopi yang intens.',
        image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
        is_featured: true,
        is_best_seller: true,
        categories: { id: 4, name: 'Minuman Siap Minum', slug: 'minuman-siap-minum' }
    },
    {
        id: 'd3333333-3333-3333-3333-333333333333',
        category_id: 4,
        name: 'Creamy Salted Caramel Latte 250ml',
        origin: 'Specialty Arabica & Caramel',
        price: 29000,
        stock: 30,
        description: 'Perpaduan lembut espresso Arabica, susu segar, sirup karamel bakar, dan sejumput garam laut Bali (sea salt) yang menciptakan keseimbangan rasa manis gurih memanjakan lidah.',
        image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
        is_featured: false,
        is_best_seller: false,
        categories: { id: 4, name: 'Minuman Siap Minum', slug: 'minuman-siap-minum' }
    }
];

const ProductModel = {
    /**
     * Mengambil daftar produk dengan filter dan sortir
     */
    async getAll({ category_id, search, sort, is_featured, is_best_seller, limit }) {
        if (isSupabaseConfigured() && supabase) {
            let query = supabase
                .from('products')
                .select('*, categories(id, name, slug)');

            if (category_id) {
                query = query.eq('category_id', category_id);
            }
            if (is_featured !== undefined) {
                query = query.eq('is_featured', is_featured === 'true' || is_featured === true);
            }
            if (is_best_seller !== undefined) {
                query = query.eq('is_best_seller', is_best_seller === 'true' || is_best_seller === true);
            }
            if (search) {
                query = query.ilike('name', `%${search}%`);
            }

            // Sortir
            if (sort === 'price_asc') {
                query = query.order('price', { ascending: true });
            } else if (sort === 'price_desc') {
                query = query.order('price', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            if (limit) {
                query = query.limit(parseInt(limit, 10));
            }

            const { data, error } = await query;
            if (error) throw new Error(error.message);
            return data;
        }

        // Logika fallback
        let results = [...fallbackProducts];

        if (category_id) {
            results = results.filter(p => p.category_id === parseInt(category_id, 10));
        }
        if (is_featured !== undefined) {
            const featVal = is_featured === 'true' || is_featured === true;
            results = results.filter(p => p.is_featured === featVal);
        }
        if (is_best_seller !== undefined) {
            const bestVal = is_best_seller === 'true' || is_best_seller === true;
            results = results.filter(p => p.is_best_seller === bestVal);
        }
        if (search) {
            const queryLower = search.toLowerCase();
            results = results.filter(p => 
                p.name.toLowerCase().includes(queryLower) || 
                (p.origin && p.origin.toLowerCase().includes(queryLower))
            );
        }

        if (sort === 'price_asc') {
            results.sort((a, b) => a.price - b.price);
        } else if (sort === 'price_desc') {
            results.sort((a, b) => b.price - a.price);
        }

        if (limit) {
            results = results.slice(0, parseInt(limit, 10));
        }

        return results;
    },

    /**
     * Mengambil detail produk berdasarkan ID
     */
    async getById(id) {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('products')
                .select('*, categories(id, name, slug, description)')
                .eq('id', id)
                .single();

            if (error) return null;
            return data;
        }

        return fallbackProducts.find(p => p.id === id) || null;
    },

    /**
     * Menambahkan produk baru
     */
    async create(productData) {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        }

        const newProduct = {
            id: 'mock-' + Date.now(),
            created_at: new Date().toISOString(),
            ...productData
        };
        fallbackProducts.push(newProduct);
        return newProduct;
    },

    /**
     * Memperbarui produk
     */
    async update(id, updateData) {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        }

        const idx = fallbackProducts.findIndex(p => p.id === id);
        if (idx === -1) return null;
        fallbackProducts[idx] = { ...fallbackProducts[idx], ...updateData };
        return fallbackProducts[idx];
    },

    /**
     * Menghapus produk
     */
    async delete(id) {
        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw new Error(error.message);
            return true;
        }

        const idx = fallbackProducts.findIndex(p => p.id === id);
        if (idx === -1) return false;
        fallbackProducts.splice(idx, 1);
        return true;
    }
};

module.exports = ProductModel;
