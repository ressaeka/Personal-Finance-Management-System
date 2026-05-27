import { createTransaksiService, getAllTransaksiService, getTransaksiByIdService, updateTransaksiService, deleteTransaksiService } from "../service/transaksi.js";

export const createTransaksi = async (req, res) => {
    try {
        const { id_category, jumlah, deskripsi, tanggal } = req.body;
        const { id_user } = req.user;

        const transaksi = await createTransaksiService(id_user, id_category, jumlah, deskripsi, tanggal);

        return res.status(201).json({
            status: "success",
            message: "Transaksi berhasil dibuat",
            data: transaksi
        });
    } catch (err) {
        return res.status(err.statusCode || 400).json({
            status: "failed",
            message: err.message
        });
    }
};

export const getAllTransaksi = async (req, res) => {
    try {
        const { id_user } = req.user;

        const transaksi = await getAllTransaksiService(id_user);

        return res.status(200).json({
            status: "success",
            message: "Berhasil mengambil semua transaksi",
            data: {
                transaksi
            }
        });

    } catch (err) {
        return res.status(err.statusCode || 400).json({
            status: "failed",
            message: err.message
        });
    }
};

export const getTransaksiById = async (req, res) => {
    try {
        const { id_transaksi } = req.params;
        const { id_user } = req.user;

        const transaksi = await getTransaksiByIdService(id_transaksi, id_user);

        return res.status(200).json({
            status: "success",
            message: "Berhasil mengambil transaksi",
            data: {
                transaksi
            }
        });
    } catch (err) {
        return res.status(err.statusCode || 400).json({
            status: "failed",
            message: err.message
        });
    }
};

export const updateTransaksi = async (req, res) => {
    try {
        const { id_category, jumlah, deskripsi, tanggal } = req.body;
        const { id_user } = req.user;
        const { id_transaksi } = req.params;

        const transaksi = await updateTransaksiService(id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal);

        return res.status(200).json({
            status: "success",
            message: "Berhasil update transaksi",
            data: transaksi
        });
    } catch (err) {
        return res.status(err.statusCode || 400).json({
            status: "failed",
            message: err.message
        });
    }
};

export const deleteTransaksi = async (req, res) => {
    try {
        const { id_user } = req.user;
        const { id_transaksi } = req.params;

        const transaksi = await deleteTransaksiService(id_transaksi, id_user);

        return res.status(200).json({
            status: "success",
            message: "Transaksi berhasil dihapus",
            data: transaksi
        });
    } catch (err) {
        return res.status(err.statusCode || 400).json({
            status: "failed",
            message: err.message
        });
    }
};
