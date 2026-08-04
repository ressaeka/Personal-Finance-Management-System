import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  updateUserById,
} from "../repositories/auth.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
} from "../utils/jwt.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { AppError } from "../utils/appError.js";
import {
  setRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  revokeAllUserTokens,
} from "../services/refreshToken.js";
import transporter from "../config/mailer.js";

export const registerService = async (userData) => {
  const existingEmail = await findUserByEmail(userData.email);

  if (existingEmail) {
    throw new AppError("Email sudah terdaftar", 409);
  }

  const existingUsername = await findUserByUsername(userData.username);

  if (existingUsername) {
    throw new AppError("Username sudah terdaftar", 409);
  }

  const hashedPassword = await hashPassword(userData.password);

  const user = await createUser({
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
  });

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const loginService = async ({ username, password }) => {
  const user = await findUserByUsername(username);

  if (!user) {
    throw new AppError("Username atau password salah", 401);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new AppError("Username atau password salah", 401);
  }

  const payload = { id: user.id, username: user.username, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await setRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
};

export const refreshTokenService = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Refresh token tidak valid atau sudah digunakan", 401);
  }

  const storedUserId = await getRefreshToken(refreshToken);

  if (!storedUserId || String(storedUserId) !== String(decoded.id)) {
    throw new AppError("Refresh token tidak valid atau sudah digunakan", 401);
  }

  await deleteRefreshToken(refreshToken);

  const payload = { id: decoded.id, username: decoded.username, email: decoded.email };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  await setRefreshToken(decoded.id, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutService = async (userId, refreshToken) => {
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }
};

export const getProfileService = async (id) => {
  const user = await findUserById(id);

  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
};

export const updateProfileService = async (id, body) => {
  const user = await findUserById(id);

  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  if (body.email) {
    const existingEmail = await findUserByEmail(body.email);

    if (existingEmail && existingEmail.id !== id) {
      throw new AppError("Email sudah terdaftar", 409);
    }
  }

  if (body.username) {
    const existingUsername = await findUserByUsername(body.username);

    if (existingUsername && existingUsername.id !== id) {
      throw new AppError("Username sudah terdaftar", 409);
    }
  }

  const updateData = {};
  if (body.username) updateData.username = body.username;
  if (body.email) updateData.email = body.email;
  if (body.password) {
    updateData.password = await hashPassword(body.password);
  }

  const updatedUser = await updateUserById(id, updateData);

  if (body.password) {
    await revokeAllUserTokens(id);
  }

  const { password, ...userWithoutPassword } = updatedUser;

  return userWithoutPassword;
};

export const forgotPasswordService = async (email) => {
  const user = await findUserByEmail(email);

  if (!user) {
    return;
  }

  const token = generateResetToken({
    id: user.id,
    email: user.email,
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Reset Password",
      html: `
        <h2>Reset Password</h2>

        <p>Klik tombol berikut untuk reset password.</p>

        <a href="${resetLink}">
          Reset Password
        </a>

        <p>Link berlaku selama 15 menit.</p>
      `,
    });
  } catch (err) {
    console.error("Gagal kirim email:", err.message);
  }
};

export const resetPasswordService = async (token, password) => {
  let decoded;
  try {
    decoded = verifyResetToken(token);
  } catch {
    throw new AppError("Token reset password tidak valid atau sudah kadaluarsa", 401);
  }

  const user = await findUserById(decoded.id);

  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  const hashedPassword = await hashPassword(password);

  await updateUserById(user.id, {
    password: hashedPassword,
  });

  await revokeAllUserTokens(user.id);
};
