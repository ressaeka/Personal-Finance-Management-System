import helmet from "helmet";

const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,

  hsts: process.env.NODE_ENV === "production",
});

export default helmetMiddleware;
