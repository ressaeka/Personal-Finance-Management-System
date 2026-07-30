import { registerService, loginService, refreshTokenService, logoutService, getProfileService, forgotPasswordService, resetPasswordService, updateProfileService } from "../services/auth.js";
import { setRefreshToken, getRefreshToken, deleteRefreshToken } from "../services/refreshToken.js";
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
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }, "Login berhasil", 200);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const result = await refreshTokenService(req.body.refreshToken);

    return successResponse( res, result, "Token berhasil diperbarui");
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

export const forgotPassword = async (req, res, next) => {
  try {
    await forgotPasswordService(req.body.email);

    return successResponse(
      res,
      null,
      "Link reset password berhasil dikirim"
    );
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await resetPasswordService(
      req.body.token,
      req.body.password
    );

    return successResponse(
      res,
      null,
      "Password berhasil diperbarui"
    );
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await logoutService(req.user.id, req.body.refreshToken);

    return successResponse(res, null, "Logout berhasil");
  } catch (err) {
    next(err);
  }
};