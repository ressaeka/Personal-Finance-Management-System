import { errorResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, _next) => {
  const isProduction = process.env.NODE_ENV === "production";

  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    req.log.error(
      {
        err,
        path: req.originalUrl,
        method: req.method,
      },
      "Server error"
    );
  } else if (statusCode >= 400) {
    req.log.warn(
      {
        err,
        path: req.originalUrl,
        method: req.method,
      },
      "Client error"
    );
  }


  let message = err.message;

  if (statusCode === 500 && isProduction) {
    message = "Internal Server Error";
  }

  return errorResponse(
    res,
    message,
    statusCode
  );
};