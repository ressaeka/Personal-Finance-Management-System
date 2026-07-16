import { z } from "zod";

const categoryTypeSchema = z.enum(["Pemasukan", "Pengeluaran"], "Tipe harus 'pemasukan' atau 'pengeluaran'");

export const userIdSchema = z.object({
  id_user: z.coerce
    .number()
    .int("ID user harus angka bulat")
    .positive("User tidak ditemukan/terautentikasi"),
});


export const categoryIdSchema = z.object({
  id_category: z.coerce
    .number()
    .int("ID category harus angka bulat")
    .positive("ID category tidak valid"),
});


export const createCategorySchema = z.object({
  nama_category: z
    .string()
    .trim()
    .min(3, "Nama category minimal 3 karakter"),

  tipe: categoryTypeSchema,
});


export const updateCategorySchema = z.object({
  nama_category: z
    .string()
    .trim()
    .min(3, "Nama category minimal 3 karakter")
    .optional(),

  tipe: categoryTypeSchema.optional(),
});