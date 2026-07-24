import { z } from "zod";

const categoryTypeSchema = z.enum(["PEMASUKAN", "PENGELUARAN"], { error: "Tipe harus 'pemasukan' atau 'pengeluaran'" });

export const userIdSchema = z.object({
  userId: z.coerce
    .number()
    .int("ID user harus angka bulat")
    .positive("User tidak ditemukan/terautentikasi"),
});


export const categoryIdSchema = z.object({
  id : z.coerce
    .number()
    .int("ID category harus angka bulat")
    .positive("ID category tidak valid"),
});


export const createCategorySchema = z.object({
  nameCategory: z
    .string()
    .trim()
    .min(3, "Nama category minimal 3 karakter"),

  tipe: categoryTypeSchema,
});


export const updateCategorySchema = z.object({
  nameCategory: z
    .string()
    .trim()
    .min(3, "Nama category minimal 3 karakter")
    .optional(),

  tipe: categoryTypeSchema.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Minimal satu field harus diisi untuk update" }
);


export const categoryQuerySchema = z.object({
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
    .catch(50),
});