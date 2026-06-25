import { AppError } from './appError.js';

export const validate = (schema, data, statusCode = 400) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, statusCode);
  }
  return result.data;
};
