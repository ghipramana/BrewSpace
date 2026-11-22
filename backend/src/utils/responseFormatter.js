/**
 * Helper untuk standarisasi format response JSON RESTful API BrewSpace
 */

/**
 * Mengirim response sukses
 * @param {Object} res - Express response object
 * @param {*} data - Data payload yang dikirimkan
 * @param {string} message - Pesan sukses
 * @param {number} statusCode - Kode status HTTP (default: 200)
 * @param {Object} meta - Metadata opsional (misal pagination)
 */
const successResponse = (res, data = null, message = 'Sukses', statusCode = 200, meta = null) => {
    const responsePayload = {
        success: true,
        message,
        data
    };

    if (meta) {
        responsePayload.meta = meta;
    }

    return res.status(statusCode).json(responsePayload);
};

/**
 * Mengirim response error
 * @param {Object} res - Express response object
 * @param {string} message - Pesan error
 * @param {number} statusCode - Kode status HTTP (default: 500)
 * @param {*} errors - Rincian detail error / validasi jika ada
 */
const errorResponse = (res, message = 'Terjadi kesalahan pada server', statusCode = 500, errors = null) => {
    const responsePayload = {
        success: false,
        message
    };

    if (errors) {
        responsePayload.errors = errors;
    }

    return res.status(statusCode).json(responsePayload);
};

module.exports = {
    successResponse,
    errorResponse
};
