import { z } from "zod";

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const registerSchema = z.object({
  username: z.string("Username wajib diisi").trim().min(3, "Username minimal 3 karakter").max(30),

  email: z
    .string("Email wajib diisi")
    .trim()
    .email("Email tidak valid")
    .transform((email) => email.toLowerCase()),

  password: z
    .string("Password wajib diisi")
    .min(8, "Password minimal 8 karakter")
    .regex(
      STRONG_PASSWORD_REGEX,
      "Password harus mengandung huruf kecil, huruf besar, angka, dan simbol",
    ),
});

export const loginSchema = z.object({
  username: z.string("Username wajib diisi").trim().min(1, "Username wajib diisi"),

  password: z.string("Password wajib diisi").min(1, "Password wajib diisi"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string("Refresh token wajib diisi").min(1, "Refresh token wajib diisi"),
});

export const updateSchema = z
  .object({
    username: z
      .string("Username harus berupa string")
      .trim()
      .min(3, "Username harus minimal 3 karakter")
      .optional(),

    email: z
      .string("Email harus berupa string")
      .trim()
      .email("Email tidak valid")
      .transform((email) => email.toLowerCase())
      .optional(),

    password: z
      .string("Password harus berupa string")
      .min(8, "Password minimal 8 karakter")
      .regex(
        STRONG_PASSWORD_REGEX,
        "Password harus mengandung huruf kecil, huruf besar, angka, dan simbol",
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token wajib diisi"),

  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(
      STRONG_PASSWORD_REGEX,
      "Password harus mengandung huruf kecil, huruf besar, angka, dan simbol",
    ),
});
