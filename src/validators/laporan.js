import { z } from "zod";

export const laporanQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format startDate harus YYYY-MM-DD")
    .optional(),

  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format endDate harus YYYY-MM-DD")
    .optional(),

  categoryId: z.coerce
    .number()
    .int("categoryId harus angka bulat")
    .positive("categoryId harus lebih dari 0")
    .optional(),

  tipe: z
    .enum(["PEMASUKAN", "PENGELUARAN"], {
      message: "tipe harus PEMASUKAN atau PENGELUARAN",
    })
    .optional(),

  page: z.coerce
    .number()
    .int("page harus angka bulat")
    .positive("page harus lebih dari 0")
    .optional()
    .default(1),

  limit: z.coerce
    .number()
    .int("limit harus angka bulat")
    .positive("limit harus lebih dari 0")
    .max(100, "limit maksimal 100")
    .optional()
    .default(10),
});
