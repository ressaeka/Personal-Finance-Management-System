import { createUser, findUserByEmail, findUserById, findUserByUsername, updateUserById } from "../repositories/auth.js";
import { generateToken } from "../utils/jwt.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { AppError } from "../utils/appError.js";

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

  const token = generateToken({
    id: user.id,
    username: user.username,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
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
  if (body.password) updateData.password = await hashPassword(body.password);

  const updatedUser = await updateUserById(id, updateData);

  const { password, ...userWithoutPassword } = updatedUser;

  return userWithoutPassword;
};