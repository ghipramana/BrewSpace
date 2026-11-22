const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const apiRoutes = require('./routes/apiRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Konfigurasi CORS
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter(Boolean)
    .map((host) => host.startsWith('http') ? host : `https://${host}`);

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.CLIENT_URL,
    ...vercelOrigins
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Izinkan request tanpa origin (seperti Postman atau curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(new Error('Akses diblokir oleh kebijakan CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-mock-user-id']
}));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Parser JSON & URL-encoded request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing API
app.use('/api', apiRoutes);

// Root path redirect/info
app.get('/', (req, res) => {
    res.json({
        app: 'BrewSpace Backend Service',
        status: 'Online',
        docs: 'Akses /api untuk melihat daftar endpoint'
    });
});

// Middleware 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
