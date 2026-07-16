import { z } from "zod";


export const userIdSchema = z.object({
  id_user: z.coerce
    .number()
    .int("ID user harus angka bulat")
    .positive("User tidak ditemukan/terautentikasi"),
});


export const transaksiIdSchema = z.object({
  id_transaksi: z.coerce
    .number()
    .int("ID transaksi harus angka bulat")
    .positive("ID transaksi tidak valid"),
});


export const categoryIdSchema = z.object({
  id_category: z.coerce
    .number()
    .int("ID category harus angka bulat")
    .positive("ID category tidak valid"),
});


export const createTransaksiSchema = z.object({
  id_category: z.coerce
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

  tanggal: z
    .string()
    .date("Format tanggal harus YYYY-MM-DD")
    .optional(),
});


export const updateTransaksiSchema = z.object({
  id_category: z.coerce
    .number()
    .int("ID category harus angka bulat")
    .positive("ID category tidak valid")
    .optional(),

  jumlah: z.coerce
    .number()
    .positive("Jumlah harus berupa angka positif")
    .optional(),

  deskripsi: z
    .string()
    .trim()
    .min(3, "Deskripsi minimal 3 karakter")
    .nullable()
    .optional(),

  tanggal: z
    .string()
    .date("Format tanggal harus YYYY-MM-DD")
    .optional(),
});