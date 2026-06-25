import { errorResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, _next) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.error("DEBUG ERROR:", err);
  } else {
    console.error(
      `PRODUCTION ERROR [${err.statusCode || 500}]: ${err.message}`,
    );
  }

  const statusCode = err.statusCode || 500;

  let message = err.message;
  if (statusCode === 500 && isProduction) {
    message = "Internal Server Error";
  }

  return errorResponse(res, message, statusCode);
};
