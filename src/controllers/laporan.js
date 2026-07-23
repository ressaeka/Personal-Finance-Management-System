import { getLaporanService } from "../services/laporan.js";
import { successResponse } from "../utils/response.js";

export const getLaporan = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { categoryId, startDate, endDate, page, limit } = req.query;

    const laporan = await getLaporanService(userId, {
      categoryId,
      startDate,
      endDate,
      page,
      limit,
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