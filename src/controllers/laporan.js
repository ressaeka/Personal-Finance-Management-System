import { generateLaporanService, getAllLaporanService, getLaporanByPeriodeService, rekapOtomatisService, deleteLaporanService } from "../service/laporan.js";
import { successResponse } from "../utils/response.js"

export const generateLaporan = async (req, res, next) => {
    try {
        const { tahun, bulan } = req.body;
        const { id_user } = req.user;

        const laporan = await generateLaporanService(id_user, tahun, bulan);

        return successResponse(res, laporan, "Laporan berhasil dibuat", 201)
    } catch (err) {
        return next(err)
    }
};

export const getAllLaporan = async (req, res, next) => {
    try {
        const { id_user } = req.user;

        const laporan = await getAllLaporanService(id_user);

        return successResponse(res, laporan, "Berhasil mengambil semua laporan", 200)
    } catch (err) {
        return next(err)
    }
};

export const getLaporanByPeriode = async (req, res, next) => {
    try {
        const { periode } = req.params;
        const { id_user } = req.user;

        const laporan = await getLaporanByPeriodeService(id_user, periode);

        return successResponse(res, laporan, "Berhasil mengambil laporan", 200)
    } catch (err) {
        return next(err)
    }
};

export const rekapOtomatis = async (req, res, next) => {
    try {
        const { tanggal } = req.body;
        const { id_user } = req.user;

        const laporan = await rekapOtomatisService(id_user, tanggal);

        return successResponse(res, laporan, "Rekap berhasil diperbarui", 200)
    } catch (err) {
        return next(err)
    }
};

export const deleteLaporan = async (req, res, next) => {
    try {
        const { id_laporan } = req.params;
        const { id_user } = req.user;

        const laporan = await deleteLaporanService(id_laporan, id_user);

        return successResponse(res, laporan, "Laporan berhasil dihapus", 200)
    } catch (err) {
        return next(err)
    }
};
