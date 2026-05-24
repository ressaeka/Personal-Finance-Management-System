import express from "express";
import { createUsers, findUserByEmail, findUserByUsername, findUserById } from "../models/auth.js";
import { generateToken } from "../utils/jwt.js"
import { hashPassword, comparePassword } from "../utils/bcrypt.js"



export const registerService = async (userData) => {
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const { username, email, password } = userData;  
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!username || !email || !password) {
            throw new Error("Username, email dan password wajib diisi");
        }
        
        if (username.trim().length < 6) {
            throw new Error("Username minimal 6 karakter");
        }
        
        if (!emailRegex.test(email)) {
            throw new Error("Format email tidak valid");
        }
        
        if (!strongPasswordRegex.test(password)) {
            throw new Error("Password harus minimal 8 karakter, mengandung huruf kecil, huruf besar, angka, dan simbol");
        }

        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            throw new Error("Email sudah terdaftar");
        }
        
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            throw new Error("Username sudah terdaftar");
        }

        const hashedPassword = await hashPassword(password)
            
        const newUser = await createUsers({
            username: username,
            email: email,
            password: hashedPassword
        });
        
        console.log("user baru", newUser);
        
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
        
    } catch (err) {
        throw err;  
    }
};

export const loginService = async ({ username, password }) => {  
    try {

        if (!username || !password) {
            throw new Error("Username dan Password wajib diisi");
        }

        const user = await findUserByUsername(username);  
        
        if (!user) {
            throw new Error("Username atau Password salah, silakan coba kembali");
        }

        const isMatch = await comparePassword(password, user.password)

        if(!isMatch) {
            throw new Error("Username dan Password salah",)
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
                email: user.email
            }
        };
    
    } catch (err) {
        throw err;
    }
};


export const getProfileService = async ({ id_user }) => {
    try {
        const user = await findUserById(id_user);
        
        if (!user) {
            throw new Error("User tidak ditemukan", 400);
        }
        
        return {
            id: user.id_user,
            username: user.username,
            email: user.email
        };
        
    } catch(err) {
        throw err;
    }
};
