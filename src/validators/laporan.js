import z from 'zod';
import { AppError } from '../utils/appError.js';
import { validate } from '../utils/validate.js';

export const validateId = (id, fieldName = 'ID') => {
  const schema = z.coerce.number({ message: `${fieldName} tidak valid` })
    .int(`${fieldName} tidak valid`)
    .positive(`${fieldName} tidak valid`);
  return validate(schema, id);
};

export const validateUser = async (findUserById, id_user) => {
  const userId = validateId(id_user, 'ID user');
  const userExists = await findUserById(userId);
  if (!userExists) {
    throw new AppError('User tidak ditemukan/terautentikasi', 401);
  }
  return userId;
};

const periodeSchema = z.string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Periode harus format YYYY-MM');

const tanggalSchema = z.coerce.date();

export const validateCreateLaporan = async (findUserById, id_user, periode, tanggal_awal, tanggal_akhir) => {
  const userId = await validateUser(findUserById, id_user);
  const validPeriode = validate(periodeSchema, periode);
  const validAwal = validate(tanggalSchema, tanggal_awal);
  const validAkhir = validate(tanggalSchema, tanggal_akhir);

  if (validAwal > validAkhir) {
    throw new AppError('tanggal_awal tidak boleh lebih besar dari tanggal_akhir', 400);
  }

  return {
    id_user: userId,
    periode: validPeriode,
    tanggal_awal: validAwal,
    tanggal_akhir: validAkhir,
  };
};

export const validateGetAllLaporan = async (findUserById, id_user) => {
  const userId = await validateUser(findUserById, id_user);
  return userId;
};

export const validateGetLaporanById = async (getLaporanById, id_laporan, id_user, findUserById) => {
  const userId = await validateUser(findUserById, id_user);
  const laporanId = validateId(id_laporan, 'ID laporan');
  const laporan = await getLaporanById(laporanId, userId);
  if (!laporan) {
    throw new AppError('Laporan tidak ditemukan', 404);
  }
  return { id_laporan: laporanId, id_user: userId, laporan };
};

export const validateUpdateLaporan = async (findUserById, getLaporanById, id_laporan, id_user, periode, tanggal_awal, tanggal_akhir) => {
  const userId = await validateUser(findUserById, id_user);
  const laporanId = validateId(id_laporan, 'ID laporan');
  const existing = await getLaporanById(laporanId, userId);
  if (!existing) {
    throw new AppError('Laporan tidak ditemukan', 404);
  }

  const validPeriode = periode ? validate(periodeSchema, periode) : existing.periode;
  const validAwal = tanggal_awal ? validate(tanggalSchema, tanggal_awal) : existing.tanggal_awal;
  const validAkhir = tanggal_akhir ? validate(tanggalSchema, tanggal_akhir) : existing.tanggal_akhir;

  if (validAwal > validAkhir) {
    throw new AppError('tanggal_awal tidak boleh lebih besar dari tanggal_akhir', 400);
  }

  return {
    id_laporan: laporanId,
    id_user: userId,
    periode: validPeriode,
    tanggal_awal: validAwal,
    tanggal_akhir: validAkhir,
  };
};

export const validateDashboardStats = (userId) => {
  return validateId(userId, 'ID user');
};

export const validateMonthlyReport = (userId) => {
  return validateId(userId, 'ID user');
};

export const validateCategoryReport = (userId) => {
  return validateId(userId, 'ID user');
};

export const validateDeleteLaporan = async (findUserById, getLaporanById, id_laporan, id_user) => {
  const userId = await validateUser(findUserById, id_user);
  const laporanId = validateId(id_laporan, 'ID laporan');
  const existing = await getLaporanById(laporanId, userId);
  if (!existing) {
    throw new AppError('Laporan tidak ditemukan', 404);
  }
  return { id_laporan: laporanId, id_user: userId };
};
