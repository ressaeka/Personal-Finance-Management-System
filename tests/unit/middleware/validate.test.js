import { jest } from "@jest/globals";
import { z } from "zod";
import { validate } from "../../../src/middleware/validate.js";

const schema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  age: z.coerce.number().positive("Umur harus positif"),
});

const createReq = (body = {}, query = {}, params = {}) => ({ body, query, params });
const createRes = () => ({});
const createNext = () => jest.fn();

describe("validate middleware", () => {
  it("should pass valid body and assign parsed data", () => {
    const req = createReq({ name: "Ressa", age: "25" });
    const next = createNext();

    validate(schema)(req, createRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: "Ressa", age: 25 });
  });

  it("should reject invalid body with joined messages", () => {
    const req = createReq({ name: "ab", age: -1 });
    const next = createNext();

    validate(schema)(req, createRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        isOperational: true,
      }),
    );
    const error = next.mock.calls[0][0];
    expect(error.message).toContain("Nama minimal 3 karakter");
    expect(error.message).toContain("Umur harus positif");
  });

  it("should validate query source", () => {
    const req = createReq({}, { page: "abc" });
    const next = createNext();

    validate(z.object({ page: z.coerce.number().catch(1) }), "query")(req, createRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query.page).toBe(1);
  });

  it("should reject invalid params source", () => {
    const req = createReq({}, {}, { id: "abc" });
    const next = createNext();

    validate(z.object({ id: z.coerce.number().int("ID harus angka") }), "params")(
      req,
      createRes(),
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });
});
