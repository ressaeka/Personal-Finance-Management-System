import { registerService, loginService, getProfileService, updateUserByIdService } from "../service/auth.js";

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const result = await registerService({ username, email, password });

        return res.status(201).json({
            status: "success",
            message: "Register berhasil",
            data: {
                id: result.id_user,
                username: result.username,
                email: result.email
            }
        });
    } catch(err) {
        return res.status(err.statusCode || 400).json({
            status: "failed",
            message: err.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await loginService({ username, password });

        return res.status(200).json({
            status: "success",
            message: "Login berhasil",
            data: result.user,
            token: result.token
        });
        
    } catch(err) {
        return res.status(err.statusCode || 400).json({
            status: "failed",
            message: err.message
        });
    }
};

export const profile = async (req, res) => {
    try {
        if (!req.user || !req.user.id_user) {
            return res.status(401).json({
                status: "failed",
                message: "User tidak terautentikasi"
            });
        }

        const { id_user } = req.user;
        const result = await getProfileService({ id_user });

        return res.status(200).json({
            status: "success",
            message: "Berhasil mengambil data user",
            data: result
        });
    } catch(err) {
        return res.status(err.statusCode || 400).json({
            status: "failed",
            message: err.message
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const id_user = req.user.id_user;
        const { username, email, password } = req.body;

        const result = await updateUserByIdService(id_user, username, email, password);

        return res.status(200).json({
            status: "success",
            message: "Berhasil memperbarui data user",
            data: result
        });
    } catch (err) {
        return res.status(err.statusCode || 400).json({
            status: "failed",
            message: err.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        if (req.user) {
            console.log(`User ${req.user.username || req.user.id_user} logout`);
        }

        return res.status(200).json({
            status: "success",
            message: "Logout berhasil",
            data: {
                instruction: "Silakan hapus token dari penyimpanan client"
            }
        });
    } catch(err) {
        return res.status(err.statusCode || 400).json({
            status: "failed",
            message: err.message
        });
    }
};
