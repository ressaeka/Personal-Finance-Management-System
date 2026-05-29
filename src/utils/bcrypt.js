import bcrypt from "bcrypt";

// --- CONFIGURATION CONSTANTS ---
const SALT_ROUNDS = 10;

/**
 * Mengamankan password teks murni (plain text) menjadi string hash acak
 * @param {string} password - Password murni kiriman user dari body request
 * @returns {Promise<string>} String password yang sudah di-hash dan siap disimpan ke database
 */
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Membandingkan dan memverifikasi kecocokan antara password murni dengan password hash di database
 * @param {string} plainPassword - Password teks murni yang diinput user saat login
 * @param {string} hashedPassword - String password terenkripsi yang diambil dari database
 * @returns {Promise<boolean>} Mengembalikan true jika password cocok, dan false jika salah
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};