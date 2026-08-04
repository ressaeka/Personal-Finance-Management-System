import { errorResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, _next) => {
  const isProduction = process.env.NODE_ENV === "production";

  const statusCode =
    Number.isInteger(err?.statusCode)
      ? err.statusCode
      : 500;

  if (statusCode >= 500) {
    req.log?.error(
      {
        err,
        path: req.originalUrl,
        method: req.method,
      },
      "Server error"
    );
  } else {
    req.log?.warn(
      {
        message: err.message,
        path: req.originalUrl,
        method: req.method,
      },
      "Client error"
    );
  }

  const message =
    statusCode === 500 && isProduction
      ? "Internal Server Error"
      : err.message;

  return errorResponse(res, message, statusCode);
};