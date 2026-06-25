import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";

export const authenticate = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AppError("Token wajib ada", 401);
    }

    if (!authorization.startsWith("Bearer ")) {
      throw new AppError("Format token salah. Gunakan: Bearer <token>", 401);
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      throw new AppError("Token kosong", 401);
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET tidak diset di environment");
      throw new AppError("Konfigurasi server error", 500);
    }

    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token sudah kadaluarsa, silakan login ulang", 401));
    }

    return next(err);
  }
};
