import { z } from "zod";

export const transaksiIdSchema = z.object({
  id: z.coerce
    .number()
    .int("ID transaksi harus angka bulat")
    .positive("ID transaksi tidak valid"),
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


export const updateTransaksiSchema = createTransaksiSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Minimal satu field harus diisi untuk update" }
);

export const transaksiQuerySchema = z.object({
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
});
