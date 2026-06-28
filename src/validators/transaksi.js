import z from 'zod';
import { AppError } from '../utils/appError.js';
import { validate } from '../utils/validate.js';



export const validateId = (id, fieldName = 'ID') => {
  const schema = z.coerce.number({ message: `${fieldName} tidak valid` })
    .int(`${fieldName} tidak valid`)
    .positive(`${fieldName} tidak valid`);
  return validate(schema, id);
};

export const validateJumlah = (jumlah) => {
  const schema = z.coerce.number({ message: 'Jumlah harus berupa angka positif' }).positive('Jumlah harus berupa angka positif');
  return validate(schema, jumlah);
};

export const validateDeskripsi = (deskripsi) => {
  if (!deskripsi) {
    throw new AppError('Deskripsi harus diisi dan minimal 3 karakter', 400);
  }
  const schema = z.string().min(3, 'Deskripsi harus diisi dan minimal 3 karakter');
  return validate(schema, deskripsi).trim();
};

export const validateTanggal = (tanggal) => {
  if (!tanggal) {
    return null;
  }
  const schema = z.coerce.date({ message: 'Format tanggal tidak valid' });
  return validate(schema, tanggal);
};

export const validateUser = async (findUserById, id_user) => {
  const userId = validateId(id_user, 'ID user');
  const userExists = await findUserById(userId);

  if (!userExists) {
    throw new AppError('User tidak ditemukan/terautentikasi', 401);
  }

  return userId;
};

export const validateCategory = async (getCategoryById, id_category, id_user) => {
  const categoryId = validateId(id_category, 'ID category');
  const category = await getCategoryById(categoryId, id_user);

  if (!category) {
    throw new AppError('Category tidak ditemukan', 404);
  }

  return { categoryId, category };
};

export const validateTransaksiOwnership = async (getTransaksiById, id_transaksi, id_user) => {
  const transaksiId = validateId(id_transaksi, 'ID transaksi');
  const transaksi = await getTransaksiById(transaksiId, id_user);

  if (!transaksi) {
    throw new AppError('Transaksi tidak ditemukan', 404);
  }

  return { transaksiId, transaksi };
};

export const validateCreateTransaksi = async (
  findUserById,
  getCategoryById,
  id_user,
  id_category,
  jumlah,
  deskripsi,
  tanggal,
) => {
  const userId = await validateUser(findUserById, id_user);
  const { categoryId, category } = await validateCategory(getCategoryById, id_category, userId);
  const jumlahAngka = validateJumlah(jumlah);
  const deskripsiFinal = deskripsi ? deskripsi.trim() : null;
  const tanggalFinal = validateTanggal(tanggal);

  const finalJumlah = category.tipe === 'pengeluaran'
    ? -Math.abs(jumlahAngka)
    : Math.abs(jumlahAngka);

  return {
    id_user: userId,
    id_category: categoryId,
    jumlah: finalJumlah,
    deskripsi: deskripsiFinal,
    tanggal: tanggalFinal || new Date(),
  };
};

export const validateGetTransaksiById = async (getTransaksiById, id_transaksi, id_user, findUserById) => {
  const userId = await validateUser(findUserById, id_user);
  const { transaksi } = await validateTransaksiOwnership(getTransaksiById, id_transaksi, userId);

  return {
    id_user: userId,
    transaksi,
  };
};

export const validateGetAllTransaksi = async (findUserById, id_user) => {
  const userId = await validateUser(findUserById, id_user);
  return userId;
};

export const validateUpdateTransaksi = async (
  findUserById,
  getTransaksiById,
  getCategoryById,
  id_transaksi,
  id_user,
  id_category,
  jumlah,
  deskripsi,
  tanggal,
) => {
  const userId = await validateUser(findUserById, id_user);
  const { transaksiId } = await validateTransaksiOwnership(getTransaksiById, id_transaksi, userId);
  const { categoryId, category } = await validateCategory(getCategoryById, id_category, userId);
  const jumlahAngka = validateJumlah(jumlah);
  const deskripsiFinal = deskripsi ? deskripsi.trim() : null;
  const tanggalFinal = validateTanggal(tanggal);

  const finalJumlah = category.tipe === 'pengeluaran'
    ? -Math.abs(jumlahAngka)
    : Math.abs(jumlahAngka);

  return {
    id_transaksi: transaksiId,
    id_user: userId,
    id_category: categoryId,
    jumlah: finalJumlah,
    deskripsi: deskripsiFinal,
    tanggal: tanggalFinal || new Date(),
  };
};

export const validateDeleteTransaksi = async (findUserById, getTransaksiById, id_transaksi, id_user) => {
  const userId = await validateUser(findUserById, id_user);
  const { transaksiId } = await validateTransaksiOwnership(getTransaksiById, id_transaksi, userId);

  return {
    id_transaksi: transaksiId,
    id_user: userId,
  };
};
