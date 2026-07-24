import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

export const authLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: {
        status: 'error',
        message: 'Terlalu banyak permintaan otentikasi, coba lagi nanti',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

export const globalLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100, // 100 requests per 15 minutes for general routes
      message: {
        status: 'error',
        message: 'Terlalu banyak permintaan, coba lagi nanti',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });