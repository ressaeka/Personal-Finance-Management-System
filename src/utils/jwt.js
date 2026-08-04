import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET belum dikonfigurasi");
}

export const generateAccessToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

export const verifyRefreshToken = (token) => jwt.verify(token, JWT_REFRESH_SECRET);

export const generateResetToken = (payload) =>
  jwt.sign(payload, JWT_RESET_SECRET, {
    expiresIn: "15m",
  });

export const verifyResetToken = (token) => jwt.verify(token, JWT_RESET_SECRET);

// backward compatibility
export const generateToken = generateAccessToken;
