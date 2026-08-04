import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";

export const authenticate = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError("Token wajib ada", 401);
    }

    if (!authorization.startsWith("Bearer ")) {
      throw new AppError(
        "Format token salah. Gunakan: Bearer <token>",
        401
      );
    }

    const [, token] = authorization.split(" ");

    if (!token) {
      throw new AppError("Token kosong", 401);
    }

    req.user = verifyToken(token);

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Token sudah kadaluarsa, silakan login ulang",
          401
        )
      );
    }

    if (err.name === "JsonWebTokenError") {
      return next(
        new AppError("Token tidak valid", 401)
      );
    }

    return next(err);
  }
};