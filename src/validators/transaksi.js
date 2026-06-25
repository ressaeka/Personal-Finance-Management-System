import { AppError } from '../utils/appError.js';

export const validateId = (id, fieldName = 'ID') => {
  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw new AppError(`${fieldName} tidak valid`, 400);
  }
  return Number(id);
};

export const validateJumlah = (jumlah) => {
  const jumlahAngka = Number(jumlah);
  if (jumlah === undefined || jumlah === null || isNaN(jumlahAngka) || jumlahAngka <= 0) {
    throw new AppError('Jumlah harus berupa angka positif', 400);
  }
  return jumlahAngka;
};

export const validateDeskripsi = (deskripsi) => {
  if (!deskripsi || deskripsi.trim().length < 3) {
    throw new AppError('Deskripsi harus diisi dan minimal 3 karakter', 400);
  }
  return deskripsi.trim();
};

export const validateTanggal = (tanggal) => {
  if (!tanggal) {
    return null;
  }

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(tanggal) || isNaN(new Date(tanggal + 'T00:00:00').getTime())) {
    throw new AppError('Format tanggal tidak valid (YYYY-MM-DD)', 400);
  }

  return tanggal;
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
