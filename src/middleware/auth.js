import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({
                status: "failed",
                message: "Token wajib ada"
            });
        }

        if (!authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "failed",
                message: "Format token salah. Gunakan: Bearer <token>"
            });
        }

        const token = authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                status: "failed",
                message: "Token kosong"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET tidak diset di environment");
            return res.status(500).json({
                status: "failed",
                message: "Konfigurasi server error"
            });
        }
        
        const decoded = verifyToken(token);

        req.user = decoded;

        next()
        
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: "failed",
                message: "Token sudah kadaluarsa, silakan login ulang"
            });
        }
        
        return res.status(401).json({
            status: "failed",
            message: "Token tidak valid"
        });
    }
};