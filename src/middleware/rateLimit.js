import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

const WINDOW_MS = 15 * 60 * 1000;

const bypassLimiter = (req, res, next) => next();

const createLimiter = ({ max, message, skip }) =>
  rateLimit({
    windowMs: WINDOW_MS,
    max,
    skip,
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res) {
      req.log?.warn(
        {
          ip: req.ip,
          path: req.originalUrl,
        },
        "Rate limit exceeded"
      );

      return res.status(429).json({
        status: "failed",
        message,
      });
    },
  });

export const authLimiter = isTest
  ? bypassLimiter
  : createLimiter({
      max: 20,
      message: "Terlalu banyak permintaan otentikasi, coba lagi nanti",
    });

export const globalLimiter = isTest
  ? bypassLimiter
  : createLimiter({
      max: 100,
      message: "Terlalu banyak permintaan, coba lagi nanti",
      skip: (req) => req.path === "/health",
    });