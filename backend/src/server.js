const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`☕ BrewSpace API Server aktif di: http://localhost:${PORT}`);
    console.log(`📦 Base API Endpoint: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('====================================================');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Menutup server BrewSpace dengan aman...');
    server.close(() => {
        console.log('Server berhasil dimatikan.');
        process.exit(0);
    });
});

module.exports = server;
