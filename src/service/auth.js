import { createUsers, findUserByEmail, findUserByUsername, findUserById, updateUserById } from "../models/auth.js";
import { generateToken } from "../utils/jwt.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";

export const registerService = async (userData) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const { username, email, password } = userData;

    if (!username || !email || !password) {
        throw new Error("Username, email dan password wajib diisi");
    }

    if (username.trim().length < 3) {
        throw new Error("Username minimal 3 karakter");
    }

    if (!emailRegex.test(email)) {
        throw new Error("Format email tidak valid");
    }

    if (!strongPasswordRegex.test(password)) {
        throw new Error("Password harus minimal 8 karakter, mengandung huruf kecil, huruf besar, angka, dan simbol");
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
        const err = new Error("Email sudah terdaftar");
        err.statusCode = 409;
        throw err;
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
        const err = new Error("Username sudah terdaftar");
        err.statusCode = 409;
        throw err;
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await createUsers({
        username: username.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

export const loginService = async ({ username, password }) => {
    if (!username || !password) {
        throw new Error("Username dan Password wajib diisi");
    }

    const user = await findUserByUsername(username);
    if (!user) {
        throw new Error("Username atau password salah");
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        throw new Error("Username atau password salah");
    }

    const token = generateToken({
        id_user: user.id_user,
        username: user.username,
        email: user.email,
    });

    return {
        token,
        user: {
            id_user: user.id_user,
            username: user.username,
            email: user.email,
        },
    };
};

export const getProfileService = async ({ id_user }) => {
    if (!id_user) {
        throw new Error("User tidak ditemukan");
    }

    const user = await findUserById(id_user);
    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    return {
        id: user.id_user,
        username: user.username,
        email: user.email,
    };
};

export const updateUserByIdService = async (id_user, username, email, password) => {
    if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
        throw new Error("Id user tidak valid");
    }

    if (!username || username.trim().length < 3) {
        throw new Error("Username harus diisi dan minimal 3 karakter");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        throw new Error("Format email tidak valid");
    }

    let hashedPassword;
    if (password) {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            throw new Error("Password harus minimal 8 karakter, mengandung huruf kecil, huruf besar, angka, dan simbol");
        }
        hashedPassword = await hashPassword(password);
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail && existingEmail.id_user !== Number(id_user)) {
        const err = new Error("Email sudah terdaftar");
        err.statusCode = 409;
        throw err;
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername && existingUsername.id_user !== Number(id_user)) {
        const err = new Error("Username sudah terdaftar");
        err.statusCode = 409;
        throw err;
    }

    const user = await findUserById(id_user);
    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    const finalPassword = hashedPassword || user.password;
    const updatedUser = await updateUserById(id_user, username.trim(), email.toLowerCase(), finalPassword);

    if (!updatedUser) {
        throw new Error("Gagal memperbarui data user");
    }

    return updatedUser;
};