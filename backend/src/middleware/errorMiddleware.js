const { errorResponse } = require('../utils/responseFormatter');

/**
 * Middleware untuk menangani request ke endpoint yang tidak ditemukan (404)
 */
const notFoundHandler = (req, res, next) => {
    return errorResponse(res, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, 404);
};

/**
 * Middleware penanganan error global (500)
 */
const errorHandler = (err, req, res, next) => {
    console.error('🔥 [Global Error Handler]:', err.stack || err.message);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan internal pada server BrewSpace';

    return errorResponse(
        res,
        message,
        statusCode,
        process.env.NODE_ENV === 'development' ? err.stack : null
    );
};

module.exports = {
    notFoundHandler,
    errorHandler
};
