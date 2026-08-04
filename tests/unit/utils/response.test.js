import { jest } from "@jest/globals";
import { successResponse, errorResponse } from "../../../src/utils/response.js";

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("successResponse", () => {
  it("should return success shape with defaults", () => {
    const res = createRes();

    successResponse(res, { id: 1 });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Success",
      data: { id: 1 },
    });
  });

  it("should use custom message and status code", () => {
    const res = createRes();

    successResponse(res, null, "Register berhasil", 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Register berhasil",
      data: null,
    });
  });
});

describe("errorResponse", () => {
  it("should return failed shape", () => {
    const res = createRes();

    errorResponse(res, "Token tidak valid", 401);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: "failed",
      message: "Token tidak valid",
    });
  });

  it("should default to 500", () => {
    const res = createRes();

    errorResponse(res, "Internal Server Error");

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
