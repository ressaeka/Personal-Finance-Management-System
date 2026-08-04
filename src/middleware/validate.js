import { AppError } from "../utils/appError.js";

export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const sources = {
      body: req.body,
      query: req.query,
      params: req.params,
    };

    const result = schema.safeParse(sources[source]);

    if (!result.success) {
      return next(
        new AppError(
          result.error.issues
            .map(issue => issue.message)
            .join(", "),
          400
        )
      );
    }

    Object.assign(sources[source], result.data);

    next();
  };
};