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

  categoryId: z
    .string()
    .regex(/^\d+$/, "categoryId harus angka")
    .transform(Number)
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
    .catch(1),

  limit: z.coerce
    .number()
    .int("limit harus angka bulat")
    .positive("limit harus lebih dari 0")
    .max(100, "limit maksimal 100")
    .catch(10),
}).refine(
  (data) => {
    const hasStart = data.startDate !== undefined;
    const hasEnd = data.endDate !== undefined;
    if (hasStart && !hasEnd) return false;
    if (!hasStart && hasEnd) return false;
    return true;
  },
  { message: "startDate dan endDate harus diisi keduanya atau tidak sama sekali" }
).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: "startDate harus sebelum atau sama dengan endDate" }
);
