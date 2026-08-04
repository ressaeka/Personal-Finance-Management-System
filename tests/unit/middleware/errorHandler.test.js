import { jest } from "@jest/globals";
import { errorHandler } from "../../../src/middleware/errorHandler.js";
import { AppError } from "../../../src/utils/appError.js";

const createReq = () => ({
  originalUrl: "/api/v1/test",
  method: "GET",
  log: { error: jest.fn(), warn: jest.fn() },
});

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("errorHandler middleware", () => {
  const originalEnv = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("should handle AppError with its statusCode", () => {
    const req = createReq();
    const res = createRes();

    errorHandler(new AppError("Category tidak ditemukan", 404), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "failed",
      message: "Category tidak ditemukan",
    });
    expect(req.log.warn).toHaveBeenCalled();
  });

  it("should log client errors as warn", () => {
    const req = createReq();
    const res = createRes();

    errorHandler(new AppError("Token wajib ada", 401), req, res, jest.fn());

    expect(req.log.warn).toHaveBeenCalled();
    expect(req.log.error).not.toHaveBeenCalled();
  });

  it("should default unknown errors to 500", () => {
    const req = createReq();
    const res = createRes();

    errorHandler(new Error("Database exploded"), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(req.log.error).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      status: "failed",
      message: "Database exploded",
    });
  });

  it("should hide internal message in production", () => {
    process.env.NODE_ENV = "production";
    const req = createReq();
    const res = createRes();

    errorHandler(new Error("Sensitive internal detail"), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "failed",
      message: "Internal Server Error",
    });
  });

  it("should still expose AppError message in production", () => {
    process.env.NODE_ENV = "production";
    const req = createReq();
    const res = createRes();

    errorHandler(new AppError("Category tidak ditemukan", 404), req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({
      status: "failed",
      message: "Category tidak ditemukan",
    });
  });

  it("should handle 4xx without logging as error", () => {
    const req = createReq();
    const res = createRes();

    errorHandler(new AppError("Bad request", 400), req, res, jest.fn());

    expect(req.log.error).not.toHaveBeenCalled();
    expect(req.log.warn).toHaveBeenCalled();
  });
});
