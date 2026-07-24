import { Prisma } from "@prisma/client";
import { errorResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, _next) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction && err.statusCode !== 404 && err.statusCode !== 409) {
    console.error("DEBUG ERROR:", err);
  } else if (err.statusCode === 500 || !err.statusCode) {
    console.error("500 ERROR:", err);
  } else {
    console.error(
      `PRODUCTION ERROR [${err.statusCode || 500}]: ${err.message}`,
    );
  }

  // Handle Prisma-specific errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return errorResponse(res, "Data sudah ada (duplikat)", 409);
      case "P2025":
        return errorResponse(res, "Data tidak ditemukan", 404);
      case "P2003":
        return errorResponse(res, "Referensi data tidak valid", 400);
      default:
        break;
    }
  }

  const statusCode = err.statusCode || 500;

  let message = err.message;
  if (statusCode === 500 && isProduction) {
    message = "Internal Server Error";
  }

  return errorResponse(res, message, statusCode);
};
