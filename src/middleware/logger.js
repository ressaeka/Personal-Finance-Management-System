import pinoHttp from "pino-http";
import crypto from "node:crypto";
import logger from "../config/logger.js";

const httpLogger = pinoHttp({
  logger,

  genReqId() {
    return crypto.randomUUID();
  },

  autoLogging: {
    ignore(req) {
      return req.url === "/health";
    },
  },

  customProps(req) {
    return {
      userId: req.user?.id,
    };
  },

  customLogLevel(req, res, err) {
    if (err || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },

  customSuccessMessage(req) {
    return `${req.method} ${req.originalUrl} completed`;
  },

  customErrorMessage(req) {
    return `${req.method} ${req.originalUrl} failed`;
  },
});

export default httpLogger;
