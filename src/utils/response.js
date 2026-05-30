/**
 * Mengirimkan respon HTTP sukses dengan format JSON yang terstandardisasi
 * @param {Object} res - Express response object
 * @param {*} data - Data yang ingin dikirim ke client (bisa berupa Object, Array, atau null)
 * @param {string} [message="success"] - Pesan sukses kustom untuk client
 * @param {number} [code=200] - HTTP Status Code sukses (default: 200 OK)
 * @returns {Object} Express json response object
 */
export const successResponse = (res, data, message = 'success', code = 200) => {
  return res.status(code).json({
    status: 'success',
    message,
    data,
  });
};

/**
 * Mengirimkan respon HTTP gagal/error dengan format JSON yang terstandardisasi
 * @param {Object} res - Express response object
 * @param {string} [message="failed"] - Pesan detail error untuk client
 * @param {number} [code=400] - HTTP Status Code error (default: 400 Bad Request)
 * @returns {Object} Express json response object
 */
export const errorResponse = (res, message = 'failed', code = 400) => {
  return res.status(code).json({
    status: 'failed',
    message,
  });
};
