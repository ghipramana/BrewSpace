-- ==============================================================================
-- BrewSpace: Data Awal (Seed Data)
-- Berisi 3 Kategori dan 12 Produk Kopi Indonesia Realistis
-- ==============================================================================

-- 1. Bersihkan data lama jika ingin reset (opsional, urutan diperhatikan)
-- DELETE FROM public.order_items;
-- DELETE FROM public.orders;
-- DELETE FROM public.cart_items;
-- DELETE FROM public.favorites;
-- DELETE FROM public.products;
-- DELETE FROM public.categories;

-- ==============================================================================
-- INSERT CATEGORIES
-- ==============================================================================
-- Hapus kategori dan produk drip bag lama dari seed sebelumnya.
DELETE FROM public.products
WHERE id IN (
    'c1111111-1111-1111-1111-111111111111',
    'c2222222-2222-2222-2222-222222222222'
);
DELETE FROM public.categories WHERE slug = 'kopi-instan-drip';

INSERT INTO public.categories (id, name, slug, description, icon_name)
VALUES
    (1, 'Biji Kopi', 'biji-kopi', 'Biji kopi sangrai pilihan (whole beans) dari berbagai pegunungan terbaik Indonesia.', 'Bean'),
    (2, 'Kopi Bubuk', 'kopi-bubuk', 'Kopi giling siap seduh dengan tingkat kehalusan presisi untuk manual brew atau tubruk.', 'Coffee'),
    (4, 'Minuman Siap Minum', 'minuman-siap-minum', 'Cold brew segar dan signature latte kemasan botol siap dinikmati kapan saja.', 'CupSoda')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    slug = EXCLUDED.slug, 
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name;

-- Reset sequence categories agar ID berikutnya otomatis
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM public.categories));

-- ==============================================================================
-- INSERT PRODUCTS
-- ==============================================================================
INSERT INTO public.products (
    id, category_id, name, origin, roast_level, price, stock, rating, reviews_count, description, image_url, is_featured, is_best_seller
) VALUES
-- 1. Arabica Aceh Gayo
(
    'a1111111-1111-1111-1111-111111111111',
    1,
    'Arabica Aceh Gayo Specialty 250g',
    'Aceh Gayo, Sumatera',
    'Medium',
    85000,
    35,
    4.9,
    142,
    'Biji kopi Arabica murni dari dataran tinggi Takengon, Aceh Gayo pada ketinggian 1.400 mdpl. Menghasilkan aroma rempah herbal yang khas, keasaman lembut (medium-low acidity), dan aftertaste cokelat karamel yang bersih dan manis seimbang.',
    'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80',
    true,
    true
),
-- 2. Robusta Lampung Gold
(
    'a2222222-2222-2222-2222-222222222222',
    1,
    'Robusta Lampung Gold Roast 250g',
    'Lampung Barat, Sumatera',
    'Dark',
    52000,
    50,
    4.7,
    88,
    'Biji kopi Robusta petik merah pilihan dari lereng pegunungan Lampung. Karakteristik rasa tebal (full body), aroma nutty panggang yang kuat, minim asam, dan krema yang tebal. Pilihan sempurna untuk campuran espresso dan es kopi susu kekinian.',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    false,
    true
),
-- 3. Arabica Toraja Sapan
(
    'a3333333-3333-3333-3333-333333333333',
    1,
    'Arabica Toraja Sapan Grade 1 200g',
    'Toraja Utara, Sulawesi',
    'Medium-Dark',
    95000,
    28,
    4.9,
    115,
    'Kopi legendaris dari dataran tinggi Sapan, Toraja. Memiliki profil rasa yang kompleks dengan sentuhan dark cocoa, rempah kayu manis, serta keasaman buah ripe fruit yang elegan. Disangrai dengan presisi untuk menonjolkan aroma eksotis khas tanah Toraja.',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    true,
    false
),
-- 4. Arabica Bali Kintamani
(
    'a4444444-4444-4444-4444-444444444444',
    1,
    'Arabica Bali Kintamani Natural 200g',
    'Kintamani, Bali',
    'Light-Medium',
    89000,
    20,
    4.8,
    76,
    'Ditanam berdampingan dengan pohon jeruk purut di tanah vulkanik Gunung Batur. Mengusung proses natural anaerobik yang menghasilkan aroma citrus menyegarkan, notes buah beri merah, rasa manis madu, dan body yang ringan dan segar.',
    'https://images.unsplash.com/photo-1610632380989-680fe40816c6?auto=format&fit=crop&w=600&q=80',
    true,
    false
),
-- 5. Arabica Flores Bajawa
(
    'a5555555-5555-5555-5555-555555555555',
    1,
    'Arabica Flores Bajawa Organic 250g',
    'Ngada, Flores, NTT',
    'Medium',
    88000,
    30,
    4.8,
    64,
    'Dihasilkan dari perkebunan organik lereng Gunung Inerie Flores. Memiliki keunikan notes tembakau manis, cokelat hitam pekat, dan keasaman vanila yang lembut. Sangat nikmat diseduh menggunakan metode V60 atau Aeropress.',
    'https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?auto=format&fit=crop&w=600&q=80',
    false,
    false
),
-- 6. Espresso Blend Nusantara
(
    'a6666666-6666-6666-6666-666666666666',
    1,
    'House Blend Espresso Nusantara 500g',
    'Multi-Origin Blend',
    'Medium-Dark',
    115000,
    40,
    4.9,
    210,
    'Racikan signature BrewSpace: perpaduan 70% Arabica Gayo & Toraja dengan 30% Robusta Lampung premium. Dirancang khusus untuk menghasilkan espresso dengan crema keemasan yang stabil, notes dark chocolate, dan hint hazelnut yang berpadu sempurna dengan susu.',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80',
    true,
    true
),
-- 7. Kopi Bubuk Tubruk Gayo Premium
(
    'b1111111-1111-1111-1111-111111111111',
    2,
    'Kopi Bubuk Tubruk Gayo Tradisional 200g',
    'Aceh Gayo, Sumatera',
    'Medium-Dark',
    48000,
    45,
    4.7,
    93,
    'Kopi bubuk giling halus siap seduh untuk penikmat kopi tubruk sejati. Menghadirkan kenikmatan aroma pekat dengan serbuk kopi yang cepat mengendap di dasar cangkir, menyisakan seduhan kopi hitam manis alami yang mantap.',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    false,
    true
),
-- 8. Kopi Bubuk Sidikalang Mantap
(
    'b2222222-2222-2222-2222-222222222222',
    2,
    'Kopi Bubuk Sidikalang Robusta 250g',
    'Dairi, Sumatera Utara',
    'Dark',
    45000,
    60,
    4.6,
    57,
    'Kopi bubuk legendaris dari tanah Sidikalang yang terkenal dengan kekuatan kafein dan aroma smoky khasnya. Sangat cocok dinikmati di pagi hari untuk mendongkrak konsentrasi kerja.',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80',
    false,
    false
),
-- 9. Fine Grind Espresso Powder
(
    'b3333333-3333-3333-3333-333333333333',
    2,
    'Fine Grind Moka Pot & Espresso Blend 200g',
    'Blend Jawa & Sumatera',
    'Dark',
    60000,
    25,
    4.8,
    42,
    'Bubuk kopi dengan tingkat kehalusan presisi untuk mesin espresso rumahan atau Moka Pot. Menghasilkan ekstraksi optimal tanpa rasa gosong atau ampas berlebih.',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    false,
    false
),
-- 12. Cold Brew Classic Black
(
    'd1111111-1111-1111-1111-111111111111',
    4,
    'Cold Brew Classic Black Bottle 250ml',
    'House Blend Single Origin',
    'Medium',
    28000,
    25,
    4.8,
    130,
    'Kopi konsentrat hitam yang diekstraksi dingin selama 16 jam penuh menggunakan air es bersuhu terkontrol. Rendah asam, sangat ramah di lambung, dan kaya akan cita rasa karamel alami. Siap diminum langsung dalam botol dingin.',
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    true,
    true
),
-- 13. Kopi Susu Gula Aren BrewSpace
(
    'd2222222-2222-2222-2222-222222222222',
    4,
    'Signature Kopi Susu Aren 250ml',
    'Espresso Blend & Aren Organik',
    'Medium-Dark',
    24000,
    50,
    4.9,
    340,
    'Minuman terlaris di gerai BrewSpace! Perpaduan double shot espresso Nusantara, fresh milk berkualitas tinggi, dan sirup gula aren murni organik asal Lebak Banten. Manis legit berpadu rasa gurih dan wangi kopi yang intens.',
    'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
    true,
    true
),
-- 14. Salted Caramel Latte
(
    'd3333333-3333-3333-3333-333333333333',
    4,
    'Creamy Salted Caramel Latte 250ml',
    'Specialty Arabica & Caramel',
    'Medium',
    29000,
    30,
    4.7,
    95,
    'Perpaduan lembut espresso Arabica, susu segar, sirup karamel bakar, dan sejumput garam laut Bali (sea salt) yang menciptakan keseimbangan rasa manis gurih memanjakan lidah.',
    'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
    false,
    false
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    origin = EXCLUDED.origin,
    roast_level = EXCLUDED.roast_level,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    rating = EXCLUDED.rating,
    reviews_count = EXCLUDED.reviews_count,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    is_featured = EXCLUDED.is_featured,
    is_best_seller = EXCLUDED.is_best_seller;
