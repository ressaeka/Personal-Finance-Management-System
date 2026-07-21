import { getLaporanService } from "../service/laporan.js";
import { successResponse } from "../utils/response.js";

export const getLaporan = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      categoryId,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;

    const laporan = await getLaporanService(userId, {
      categoryId,
      startDate,
      endDate,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    return successResponse(
      res,
      laporan,
      "Berhasil mengambil laporan"
    );
  } catch (err) {
    next(err);
  }
};