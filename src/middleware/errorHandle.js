import { errorResponse } from "../utils/response.js";

/**
 * Middleware Global untuk menangkap dan menstrukturkan seluruh error di aplikasi
 * @param {Object} err - Objek error yang ditangkap
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const errorHandle = (err, req, res, next) => {
    const isProduction = process.env.NODE_ENV === "production";

    // Logging error ke console server untuk kebutuhan debugging
    if (!isProduction) {
        console.error("DEBUG ERROR:", err);
    } else {
        console.error(`PRODUCTION ERROR [${err.statusCode || 500}]: ${err.message}`);
    }

    // Handle khusus error dari jsonwebtoken library
    if (err.name === "TokenExpiredError") {
        return errorResponse(res, "Token sudah expired", 401);
    }

    if (err.name === "JsonWebTokenError") {
        return errorResponse(res, "Token tidak valid", 401);
    }

    // Tentukan status code: gunakan err.statusCode (dari AppError), jika tidak ada default ke 500
    const statusCode = err.statusCode || 500;

    // Tentukan pesan: jika error 500 dan di production, sembunyikan pesan asli demi keamanan
    let message = err.message;
    if (statusCode === 500 && isProduction) {
        message = "Internal Server Error";
    }

    return errorResponse(res, message, statusCode);
};