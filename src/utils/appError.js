/**
 * Kelas kustom untuk menangani error spesifik aplikasi (Operational Error)
 * Memperluas kelas Error bawaan JavaScript dengan menambahkan properti HTTP Status Code
 * @extends Error
 */
export class AppError extends Error {
    /**
     * Membuat instance dari AppError
     * @param {string} message - Pesan detail mengenai error yang terjadi
     * @param {number} [statusCode=400] - HTTP Status Code yang sesuai (default: 400 Bad Request)
     */
    constructor(message, statusCode = 400) {
        // Memanggil constructor dari parent class (Error) untuk mengeset message
        super(message);
        
        // Mengubah nama identitas error menjadi AppError (bukan Error biasa)
        this.name = "AppError";
        
        // Menyimpan properti HTTP status code untuk dibaca oleh global error handler
        this.statusCode = statusCode;

        // Menjaga stack trace yang bersih (opsional, membantu saat tracking baris kode yang error)
        Error.captureStackTrace(this, this.constructor);
    }
}