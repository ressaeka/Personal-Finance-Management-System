import { z } from "zod";


const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const registerSchema = z.object({

  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(30),


  email: z
    .string()
    .trim()
    .email("Email tidak valid")
    .transform((email) => email.toLowerCase()),


  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(STRONG_PASSWORD_REGEX , "Password harus mengandung huruf kecil, huruf besar, angka, dan simbol")

});


export const loginSchema = z.object({

    username : z
    .string()
    .trim()
    .min(1, "Username wajib diisi"),


    password : z
    .string()
    .min(1, "Password Wajib diisi")

})


export const updateSchema = z.object ({
  
    username : z
    .string()
    .trim()
    .min(3, "Username harus minimal 3 karakter")
    .optional(),

    email : z 
    .string()
    .trim()
    .email("email tidak valid").transform((email) => email.toLowerCase())
    .optional(),


    password : z
    .string()
    .min(8, "password minimal 8 karakter")
    .regex( STRONG_PASSWORD_REGEX , "Password harus mengandung huruf kecil, huruf besar, angka, dan simbol" )
    .optional(),

})
