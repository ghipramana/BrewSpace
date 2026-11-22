const express = require('express');
const router = express.Router();

const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const userRoutes = require('./userRoutes');

// Root API Health Check
router.get('/', (req, res) => {
    res.json({
        success: true,
        name: 'BrewSpace RESTful API',
        version: '1.0.0',
        message: 'Selamat datang di API Marketplace Kopi BrewSpace',
        endpoints: {
            categories: '/api/categories',
            products: '/api/products',
            favorites: '/api/favorites',
            cart: '/api/cart',
            orders: '/api/orders',
            users: '/api/users'
        }
    });
});

// Registrasi modul rute
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);

module.exports = router;
