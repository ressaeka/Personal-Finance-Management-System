import { z } from "zod";

export const userIdSchema = z.object({
  userId: z.coerce
    .number()
    .int("ID user harus angka bulat")
    .positive("User tidak ditemukan"),
});

export const transaksiIdSchema = z.object({
  id: z.coerce
    .number()
    .int("ID transaksi harus angka bulat")
    .positive("ID transaksi tidak valid"),
});

export const categoryIdSchema = z.object({
  categoryId: z.coerce
    .number()
    .int("ID category harus angka bulat")
    .positive("ID category tidak valid"),
});

export const createTransaksiSchema = z.object({
  categoryId: z.coerce
    .number()
    .int("ID category harus angka bulat")
    .positive("ID category tidak valid"),

  jumlah: z.coerce
    .number()
    .positive("Jumlah harus berupa angka positif"),

  deskripsi: z
    .string()
    .trim()
    .min(3, "Deskripsi minimal 3 karakter")
    .nullable()
    .optional(),

  tanggal: z.coerce
    .date()
    .optional(),
});

export const updateTransaksiSchema = createTransaksiSchema.partial();


