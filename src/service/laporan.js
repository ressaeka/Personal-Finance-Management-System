import { upsertLaporan, getAllLaporan, getLaporanByPeriode, generateLaporanBulanan, rekapOtomatis, deleteLaporan } from "../models/laporan.js";
import { AppError } from "../utils/appError.js";

export const generateLaporanService = async (id_user, tahun, bulan) => {
    if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
        throw new Error("User tidak valid");
    }

    if (!tahun || !bulan) {
        throw new Error("Tahun dan bulan harus diisi");
    }

    const tahunNum = parseInt(tahun);
    const bulanNum = parseInt(bulan);

    if (isNaN(tahunNum) || tahunNum < 2000 || tahunNum > 2100) {
        throw new Error("Tahun tidak valid");
    }

    if (isNaN(bulanNum) || bulanNum < 1 || bulanNum > 12) {
        throw new Error("Bulan tidak valid (1-12)");
    }

    const laporan = await generateLaporanBulanan(id_user, tahunNum, bulanNum);
    if (!laporan) {
        throw new Error("Laporan gagal dibuat");
    }

    return laporan;
};

export const getAllLaporanService = async (id_user) => {
    if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
        throw new Error("User tidak valid");
    }

    return await getAllLaporan(id_user);
};

export const getLaporanByPeriodeService = async (id_user, periode) => {
    if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
        throw new Error("User tidak valid");
    }

    if (!periode) {
        throw new Error("Periode harus diisi");
    }

    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(periode)) {
        throw new Error("Format periode tidak valid (YYYY-MM)");
    }

    const laporan = await getLaporanByPeriode(id_user, periode);
    if (!laporan) {
        throw new AppError("Laporan tidak ditemukan", 404)
    }

    return laporan;
};

export const rekapOtomatisService = async (id_user, tanggal) => {
    if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
        throw new Error("User tidak valid");
    }

    if (!tanggal) {
        throw new Error("Tanggal harus diisi");
    }

    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(tanggal) || isNaN(new Date(tanggal + "T00:00:00").getTime())) {
        throw new Error("Format tanggal tidak valid (YYYY-MM-DD)");
    }

    const updated = await rekapOtomatis(id_user, tanggal);
    return updated;
};

export const deleteLaporanService = async (id_laporan, id_user) => {
    if (!id_laporan || !Number.isInteger(Number(id_laporan)) || Number(id_laporan) <= 0) {
        throw new Error("ID laporan tidak valid");
    }

    if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
        throw new Error("User tidak valid");
    }

    const laporan = await deleteLaporan(id_laporan, id_user);
    if (!laporan) {
        throw new AppError("Laporan tidak ditemukan", 404)
    }

    return laporan;
};