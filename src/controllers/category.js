import express from "express";
import { categoryService, getAllCategoryService } from "../service/category.js";  

export const category = async (req, res) => {
    try {
        const { nama_category, tipe } = req.body;
        const id_user = req.user.id_user; 
        
        console.log("Request:", req.body);

        
        const category = await categoryService(id_user, nama_category, tipe);

        res.status(201).json({
            status: "Success",
            message: "Category berhasil dibuat",
            data: {
                id_category: category.id_category,  
                nama_category: category.nama_category,
                tipe: category.tipe
            }
        });
        
    } catch (err) {
        return res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

export const getAllCategory = async (req, res, next) => {
    try {
        const { id_user} = req.user;  

        const category = await getAllCategoryService(id_user);  

        return res.status(200).json({
            status:"Success",
            message:"Berhasil mengambil semua Category",
            data: {
                category
            }
        })
    } catch (err) {
        return res.status(400).json({
            status:"failed",
            message:err.message
        })  
    }
};