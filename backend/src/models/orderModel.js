const { supabase, isSupabaseConfigured } = require('../config/supabase');
const CartModel = require('./cartModel');

// In-memory orders untuk pengujian offline/lokal
let fallbackOrders = [
    {
        id: 'o1111111-1111-1111-1111-111111111111',
        order_number: 'BS-20261120-001',
        user_id: 'u0000000-0000-0000-0000-000000000001',
        total_amount: 170000,
        status: 'Diproses',
        shipping_address: 'Jl. Merdeka No. 45, Jakarta Selatan',
        shipping_phone: '081234567890',
        payment_method: 'Transfer Bank (Simulasi)',
        notes: 'Tolong packing buble wrap tebal ya',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        order_items: [
            {
                id: 'oi-1',
                product_id: 'a1111111-1111-1111-1111-111111111111',
                product_name: 'Arabica Aceh Gayo Specialty 250g',
                price: 85000,
                quantity: 2,
                grind_option: 'Biji Utuh',
                subtotal: 170000
            }
        ]
    }
];

const OrderModel = {
    /**
     * Mengambil daftar pesanan user
     */
    async getByUserId(userId) {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    order_number,
                    total_amount,
                    status,
                    shipping_address,
                    shipping_phone,
                    payment_method,
                    notes,
                    created_at,
                    order_items (
                        id,
                        product_id,
                        product_name,
                        price,
                        quantity,
                        grind_option,
                        subtotal
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return data;
        }

        return fallbackOrders.filter(o => o.user_id === userId);
    },

    /**
     * Mengambil detail satu pesanan berdasarkan ID
     */
    async getById(id, userId = null) {
        if (isSupabaseConfigured() && supabase) {
            let query = supabase
                .from('orders')
                .select(`
                    id,
                    order_number,
                    user_id,
                    total_amount,
                    status,
                    shipping_address,
                    shipping_phone,
                    payment_method,
                    notes,
                    created_at,
                    order_items (
                        id,
                        product_id,
                        product_name,
                        price,
                        quantity,
                        grind_option,
                        subtotal
                    )
                `)
                .eq('id', id);

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query.single();
            if (error) return null;
            return data;
        }

        const order = fallbackOrders.find(o => o.id === id && (!userId || o.user_id === userId));
        return order || null;
    },

    /**
     * Membuat pesanan baru dan menyimpan detail item pesanan
     */
    async createOrder({ userId, totalAmount, shippingAddress, shippingPhone, paymentMethod, notes, items }) {
        // Format order number: BS-YYYYMMDD-XXXX (4 digit random/timestamp)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomHex = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `BS-${dateStr}-${randomHex}`;

        if (isSupabaseConfigured() && supabase) {
            // 1. Simpan order header
            const { data: newOrder, error: orderErr } = await supabase
                .from('orders')
                .insert([{
                    order_number: orderNumber,
                    user_id: userId,
                    total_amount: totalAmount,
                    status: 'Diproses',
                    shipping_address: shippingAddress,
                    shipping_phone: shippingPhone,
                    payment_method: paymentMethod || 'Transfer Bank (Simulasi)',
                    notes: notes || null
                }])
                .select()
                .single();

            if (orderErr) throw new Error(orderErr.message);

            // 2. Simpan order items
            const orderItemsPayload = items.map(item => ({
                order_id: newOrder.id,
                product_id: item.product_id,
                product_name: item.product_name,
                price: item.price,
                quantity: item.quantity,
                grind_option: item.grind_option || 'Biji Utuh',
                subtotal: item.price * item.quantity
            }));

            const { error: itemsErr } = await supabase
                .from('order_items')
                .insert(orderItemsPayload);

            if (itemsErr) throw new Error(itemsErr.message);

            // 3. Kosongkan keranjang belanja user
            await CartModel.clearCart(userId);

            // Kembalikan order utuh dengan items
            return this.getById(newOrder.id, userId);
        }

        // Mode fallback
        const newOrder = {
            id: 'ord-' + Date.now(),
            order_number: orderNumber,
            user_id: userId,
            total_amount: totalAmount,
            status: 'Diproses',
            shipping_address: shippingAddress,
            shipping_phone: shippingPhone,
            payment_method: paymentMethod || 'Transfer Bank (Simulasi)',
            notes: notes || null,
            created_at: new Date().toISOString(),
            order_items: items.map((item, idx) => ({
                id: 'oi-' + Date.now() + '-' + idx,
                product_id: item.product_id,
                product_name: item.product_name,
                price: item.price,
                quantity: item.quantity,
                grind_option: item.grind_option || 'Biji Utuh',
                subtotal: item.price * item.quantity
            }))
        };

        fallbackOrders.unshift(newOrder);
        await CartModel.clearCart(userId);
        return newOrder;
    },

    /**
     * Memperbarui status pesanan (Pending, Diproses, Dikirim, Selesai, Dibatalkan)
     */
    async updateStatus(id, status) {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        }

        const order = fallbackOrders.find(o => o.id === id);
        if (order) {
            order.status = status;
            return order;
        }
        return null;
    }
};

module.exports = OrderModel;
