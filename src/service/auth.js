import { createUser, findUserByEmail, findUserById, findUserByUsername, updateUserById } from "../repositories/auth.js";
import { generateToken } from "../utils/jwt.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { validateRegister, validateLogin, validateUserId, validateUpdateProfile} from "../validators/auth.js";
import { AppError } from "../utils/appError.js";

export const registerService = async (userData) => {
  const validatedData = validateRegister(
    userData.username,
    userData.email,
    userData.password
  );

  const existingEmail = await findUserByEmail(validatedData.email);

  if (existingEmail) {
    throw new AppError("Email sudah terdaftar", 409);
  }

  const existingUsername = await findUserByUsername(validatedData.username);

  if (existingUsername) {
    throw new AppError("Username sudah terdaftar", 409);
  }

  const hashedPassword = await hashPassword(validatedData.password);

  const user = await createUser({
    username: validatedData.username,
    email: validatedData.email,
    password: hashedPassword,
  });

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const loginService = async ({ username, password }) => {
  const validatedData = validateLogin(username, password);

  const user = await findUserByUsername(validatedData.username);

  if (!user) {
    throw new AppError("Username atau password salah", 401);
  }

  const isMatch = await comparePassword(
    validatedData.password,
    user.password
  );

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
  const validUserId = validateUserId(id);

  const user = await findUserById(validUserId);

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

export const updateProfileService = async ( id, username, email, password ) => {
  const validatedData = validateUpdateProfile(
    id,
    username,
    email,
    password
  );

  const user = await findUserById(validatedData.id);

  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  if (validatedData.email) {
    const existingEmail = await findUserByEmail(validatedData.email);

    if (existingEmail && existingEmail.id !== validatedData.id) {
      throw new AppError("Email sudah terdaftar", 409);
    }
  }

  if (validatedData.username) {
    const existingUsername = await findUserByUsername(
      validatedData.username
    );

    if (
      existingUsername &&
      existingUsername.id !== validatedData.id
    ) {
      throw new AppError("Username sudah terdaftar", 409);
    }
  }

  const updatedUser = await updateUserById(validatedData.id, {
    username: validatedData.username ?? user.username,
    email: validatedData.email ?? user.email,
    password: validatedData.password
      ? await hashPassword(validatedData.password)
      : user.password,
  });

  const { password: _, ...userWithoutPassword } = updatedUser;

  return userWithoutPassword;
};