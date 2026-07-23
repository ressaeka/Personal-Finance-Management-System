import { registerService, loginService, getProfileService, updateProfileService } from "../services/auth.js";
import { successResponse } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerService(req.body);

    return successResponse( res,
      {
        id: result.id,
        username: result.username,
        email: result.email,
      }, "Register berhasil", 201 );
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginService(req.body);

    return successResponse( res,
      {
        user: result.user,
        token: result.token,
      }, "Login berhasil", 200);
  } catch (err) {
    next(err);
  }
};

export const profile = async (req, res, next) => {
  try {
    const result = await getProfileService(req.user.id);

    return successResponse( res, result, "Berhasil mengambil data user" );
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const result = await updateProfileService(
      req.user.id,
      req.body
    );

    return successResponse( res, result, "Berhasil memperbarui data user");
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    return successResponse(res,
      {
        instruction: "Silakan hapus token dari client",
      },"Logout berhasil"
    );
  } catch (err) {
    next(err);
  }
};