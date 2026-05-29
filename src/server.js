import app from "./app.js";

/**
 * Port yang digunakan oleh server aplikasi.
 * Mengambil nilai dari environment variable PORT atau default ke port 3000.
 * @type {number|string}
 */
const port = process.env.PORT || 3000;

/**
 * Hostname penyalur request jaringan.
 * Menentukan host berdasarkan status environment variable HOST.
 * @type {string}
 */
const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

/**
 * Menjalankan server Express untuk mulai mendengarkan request masuk
 */
app.listen(port, host, () => {
    console.log(`Server is running http://${host}:${port}`)
})