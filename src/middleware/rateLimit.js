import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

const authLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: {
        status: 'error',
        message: 'Terlalu banyak permintaan, coba lagi nanti',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

export default authLimiter;