import { createUsers, findUserByEmail, findUserByUsername, findUserById, updateUserById } from "../models/auth.js";
import { generateToken } from "../utils/jwt.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { validateRegister, validateLogin, validateUserId, validateUpdateProfile } from "../validators/auth.js";
import { AppError } from "../utils/appError.js";

export const registerService = async (userData) => {
  const { username, email, password } = userData;
  const validatedData = validateRegister(username, email, password);

  const existingEmail = await findUserByEmail(validatedData.email);
  if (existingEmail) {
    throw new AppError("Email sudah terdaftar", 409);
  }

  const existingUser = await findUserByUsername(validatedData.username);
  if (existingUser) {
    throw new AppError("Username sudah terdaftar", 409);
  }

  const hashedPassword = await hashPassword(validatedData.password);
  const newUser = await createUsers({
    username: validatedData.username,
    email: validatedData.email,
    password: hashedPassword,
  });

  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const loginService = async ({ username, password }) => {
  const validatedData = validateLogin(username, password);

  const user = await findUserByUsername(validatedData.username);
  if (!user) {
    throw new AppError("Username atau password salah", 401);
  }

  const isMatch = await comparePassword(validatedData.password, user.password);
  if (!isMatch) {
    throw new AppError("Username atau password salah", 401);
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
  const validUserId = validateUserId(id_user);

  const user = await findUserById(validUserId);
  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  return {
    id: user.id_user,
    username: user.username,
    email: user.email,
  };
};

export const updateUserByIdService = async (id_user, username, email, password) => {
  const validatedData = validateUpdateProfile(id_user, username, email, password);

  if (validatedData.email) {
    const existingEmail = await findUserByEmail(validatedData.email);
    if (existingEmail && existingEmail.id_user !== validatedData.id_user) {
      throw new AppError("Email sudah terdaftar", 409);
    }
  }

  if (validatedData.username) {
    const existingUsername = await findUserByUsername(validatedData.username);
    if (existingUsername && existingUsername.id_user !== validatedData.id_user) {
      throw new AppError("Username sudah terdaftar", 409);
    }
  }

  const user = await findUserById(validatedData.id_user);
  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  const finalUsername = validatedData.username ?? user.username;
  const finalEmail = validatedData.email ?? user.email;
  const finalPassword = validatedData.password
    ? await hashPassword(validatedData.password)
    : user.password;

  const updatedUser = await updateUserById(
    validatedData.id_user,
    finalUsername,
    finalEmail,
    finalPassword,
  );

  if (!updatedUser) {
    throw new AppError("Gagal memperbarui data user", 500);
  }

  return updatedUser;
};
