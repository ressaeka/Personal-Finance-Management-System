import { AppError } from "../utils/appError.js";

export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const data =
      source === "query"
        ? req.query
        : source === "params"
          ? req.params
          : req.body;

    const result = schema.safeParse(data);

    if (!result.success) {
      return next(
        new AppError(
          result.error.issues.map((issue) => issue.message).join(", "),
          400
        )
      );
    }

    if (source === "query") {
      Object.assign(req.query, result.data);
    } else if (source === "params") {
      Object.assign(req.params, result.data);
    } else {
      req.body = result.data;
    }

    next();
  };
};