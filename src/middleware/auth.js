import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';

/**
 * Middleware untuk memvalidasi token JWT pada endpoint yang terproteksi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const authenticate = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AppError('Token wajib ada', 401);
    }

    if (!authorization.startsWith('Bearer ')) {
      throw new AppError('Format token salah. Gunakan: Bearer <token>', 401);
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new AppError('Token kosong', 401);
    }

    // Error 500 jika lupa setting .env di server/vps
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET tidak diset di environment!');
      throw new AppError('Internal Server Error', 500);
    }

    // Verifikasi token, jika gagal otomatis melempar error ke blok catch
    const decoded = verifyToken(token);

    // Menyimpan data user hasil decode ke object request agar bisa diakses di Controller/Service
    req.user = decoded;

    // Lanjut ke controller berikutnya
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(
        new AppError('Token sudah kadaluarsa, silakan login ulang', 401),
      );
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
      return next(new AppError('Token tidak valid', 401));
    }
    return next(err);
  }
};
