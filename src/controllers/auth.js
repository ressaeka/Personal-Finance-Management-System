import { registerService, loginService, getProfileService, updateUserByIdService } from "../service/auth.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await registerService({ username, email, password });

    return successResponse(res, {
      id: result.id_user,
      username: result.username,
      email: result.email,
    }, "Register berhasil", 201);
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await loginService({ username, password });

    return successResponse(res,{
     user: result.user,
     token: result.token
    }, 'Login berhasil', 200 );

  } catch (err) {
    return next(err);
  }
};

export const profile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id_user) {
      throw new Error("User tidak terautentikasi");
    }

    const { id_user } = req.user;
    const result = await getProfileService({ id_user });

    return successResponse(res, result, "Berhasil mengambil data user");
  } catch (err) {
    return next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const id_user = req.user.id_user;
    const { username, email, password } = req.body;

    const result = await updateUserByIdService(id_user, username, email, password);

    return successResponse(res, result, "Berhasil memperbarui data user");
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    return successResponse(res, {
      instruction: "Silakan hapus token dari penyimpanan client",
    }, "Logout berhasil");
  } catch (err) {
    return next(err);
  }
};
