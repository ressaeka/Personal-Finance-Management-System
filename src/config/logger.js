import pino from "pino";
import pinoHttp from "pino-http";


const logger = pino({
  level: process.env.LOG_LEVEL || "info",

  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "req.body.password",
    "req.body.refreshToken"
  ],

  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname"
          }
        }
      : undefined
});

export default logger;