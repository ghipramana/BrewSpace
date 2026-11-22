/**
 * Skrip Verifikasi Mandiri RESTful API BrewSpace
 * Menjalankan uji menyeluruh seluruh endpoint backend
 */
const http = require('http');
const app = require('./src/app');

const PORT = 5001; // Port khusus testing
let server;

// Helper HTTP request sederhana
const makeRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });

        req.on('error', reject);

        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
};

async function runTests() {
    console.log('\n======================================================');
    console.log('🧪 Memulai Pengujian Endpoint Backend BrewSpace...');
    console.log('======================================================\n');

    await new Promise((resolve) => {
        server = app.listen(PORT, '127.0.0.1', () => {
            console.log(`Server test listening on 127.0.0.1:${PORT}`);
            resolve();
        });
    });
    let passed = 0;
    let failed = 0;

    const testEndpoint = async (name, testFn) => {
        try {
            await testFn();
            console.log(`✅ [PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`❌ [FAIL] ${name}:`, err);
            failed++;
        }
    };

    const token = 'demo-test-token';
    const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const HOST = '127.0.0.1';

    // 1. Health check
    await testEndpoint('GET /api (Health Check)', async () => {
        const res = await makeRequest({ host: HOST, port: PORT, path: '/api', method: 'GET' });
        if (res.status !== 200 || !res.data.success) throw new Error(`Status ${res.status}`);
    });

    // 2. Categories
    await testEndpoint('GET /api/categories (Daftar Kategori)', async () => {
        const res = await makeRequest({ host: HOST, port: PORT, path: '/api/categories', method: 'GET' });
        if (res.status !== 200 || !Array.isArray(res.data.data) || res.data.data.length < 4) {
            throw new Error(`Kategori kurang dari 4 atau status ${res.status}`);
        }
    });

    // 3. Products All
    await testEndpoint('GET /api/products (Katalog Produk)', async () => {
        const res = await makeRequest({ host: HOST, port: PORT, path: '/api/products', method: 'GET' });
        if (res.status !== 200 || !Array.isArray(res.data.data) || res.data.data.length < 12) {
            throw new Error(`Produk kurang dari 12 (${res.data.data?.length}) atau status ${res.status}`);
        }
    });

    // 4. Products Filter & Sort
    await testEndpoint('GET /api/products?category_id=1&sort=price_asc (Filter & Sort)', async () => {
        const res = await makeRequest({ host: HOST, port: PORT, path: '/api/products?category_id=1&sort=price_asc', method: 'GET' });
        if (res.status !== 200 || res.data.data.length === 0) throw new Error(`Filter gagal, status: ${res.status}`);
    });

    // 5. Products Search
    await testEndpoint('GET /api/products?search=Gayo (Pencarian Produk)', async () => {
        const res = await makeRequest({ host: HOST, port: PORT, path: '/api/products?search=Gayo', method: 'GET' });
        if (res.status !== 200 || res.data.data.length === 0) throw new Error(`Search gagal`);
    });

    // 6. Product Detail
    await testEndpoint('GET /api/products/:id (Detail Produk)', async () => {
        const res = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/products/a1111111-1111-1111-1111-111111111111',
            method: 'GET'
        });
        if (res.status !== 200 || !res.data.data.name) throw new Error(`Detail produk tidak ditemukan`);
    });

    // 7. Cart Get
    await testEndpoint('GET /api/cart (Ambil Keranjang)', async () => {
        const res = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/cart',
            method: 'GET',
            headers: authHeaders
        });
        if (res.status !== 200 || !res.data.data.summary) throw new Error(`Format keranjang salah`);
    });

    // 8. Cart Add Item
    await testEndpoint('POST /api/cart (Tambah Item ke Keranjang)', async () => {
        const res = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/cart',
            method: 'POST',
            headers: authHeaders
        }, {
            product_id: 'a2222222-2222-2222-2222-222222222222',
            quantity: 1,
            grind_option: 'Sedang'
        });
        if (res.status !== 201 || !res.data.success) throw new Error(`Gagal tambah keranjang, status: ${res.status}`);
    });

    // 9. Favorites Get
    await testEndpoint('GET /api/favorites (Daftar Favorit)', async () => {
        const res = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/favorites',
            method: 'GET',
            headers: authHeaders
        });
        if (res.status !== 200 || !Array.isArray(res.data.data)) throw new Error(`Gagal ambil favorit`);
    });

    // 10. Favorites Add & Remove
    await testEndpoint('POST & DELETE /api/favorites (Toggle Favorit)', async () => {
        const addRes = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/favorites',
            method: 'POST',
            headers: authHeaders
        }, { product_id: 'a3333333-3333-3333-3333-333333333333' });
        if (addRes.status !== 201 && addRes.status !== 200) throw new Error(`Gagal tambah favorit`);

        const delRes = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/favorites/a3333333-3333-3333-3333-333333333333',
            method: 'DELETE',
            headers: authHeaders
        });
        if (delRes.status !== 200) throw new Error(`Gagal hapus favorit`);
    });

    // 11. Orders Checkout Simulation
    await testEndpoint('POST /api/orders (Simulasi Checkout Pesanan)', async () => {
        const res = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/orders',
            method: 'POST',
            headers: authHeaders
        }, {
            shipping_address: 'Jl. Malioboro No. 10, Yogyakarta',
            shipping_phone: '081234567899',
            payment_method: 'QRIS (Simulasi)',
            notes: 'Kopi jangan terlalu manis'
        });
        if (res.status !== 201 || !res.data.data.order_number) throw new Error(`Gagal checkout pesanan, status: ${res.status}`);
    });

    // 12. Orders List
    await testEndpoint('GET /api/orders (Riwayat Pesanan)', async () => {
        const res = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/orders',
            method: 'GET',
            headers: authHeaders
        });
        if (res.status !== 200 || !Array.isArray(res.data.data) || res.data.data.length === 0) {
            throw new Error(`Pesanan tidak muncul di riwayat`);
        }
    });

    // 13. User Profile Get & Update
    await testEndpoint('GET & PUT /api/users/:id (Profil Pengguna)', async () => {
        const getRes = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/users/u0000000-0000-0000-0000-000000000001',
            method: 'GET',
            headers: authHeaders
        });
        if (getRes.status !== 200) throw new Error(`Gagal ambil profil`);

        const putRes = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/users/u0000000-0000-0000-0000-000000000001',
            method: 'PUT',
            headers: authHeaders
        }, {
            full_name: 'Barista Mahasiswa Hebat'
        });
        if (putRes.status !== 200 || putRes.data.data.full_name !== 'Barista Mahasiswa Hebat') {
            throw new Error(`Gagal update profil`);
        }
    });

    // 14. Auth Protection (401 Unauthorized)
    await testEndpoint('Security: 401 Unauthorized jika tanpa token', async () => {
        const res = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/cart',
            method: 'GET'
            // no auth header
        });
        if (res.status !== 401) throw new Error(`Expected status 401 but got ${res.status}`);
    });

    // 15. 404 Unknown Route
    await testEndpoint('Handling: 404 Not Found untuk endpoint tidak valid', async () => {
        const res = await makeRequest({
            host: HOST,
            port: PORT,
            path: '/api/rute-ngawur',
            method: 'GET'
        });
        if (res.status !== 404) throw new Error(`Expected status 404 but got ${res.status}`);
    });

    server.close();

    console.log('\n======================================================');
    console.log(`🎉 HASIL PENGUJIAN API: ${passed} BERHASIL | ${failed} GAGAL`);
    console.log('======================================================\n');

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests().catch(err => {
    console.error('Fatal testing error:', err);
    if (server) server.close();
    process.exit(1);
});
