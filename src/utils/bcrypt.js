import bcrypt from "bcrypt";


export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12)
}

export const comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword)
}