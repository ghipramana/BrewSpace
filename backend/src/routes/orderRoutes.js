const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { verifyAuth } = require('../middleware/authMiddleware');
const { validateCheckout } = require('../middleware/validator');

// Semua rute pesanan membutuhkan otentikasi user
router.use(verifyAuth);

// GET /api/orders - Riwayat seluruh pesanan user
router.get('/', OrderController.getOrders);

// GET /api/orders/:id - Rincian satu pesanan
router.get('/:id', OrderController.getOrderById);

// POST /api/orders - Buat pesanan baru (Simulasi checkout)
router.post('/', validateCheckout, OrderController.createOrder);

// PUT /api/orders/:id/status - Update status pesanan
router.put('/:id/status', OrderController.updateOrderStatus);

module.exports = router;
