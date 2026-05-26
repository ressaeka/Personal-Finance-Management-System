import express from "express";
import { categoryService, getAllCategoryService, getCategoryByIdService, updateCategoryService, deleteCategoryService } from "../service/category.js";  

export const category = async (req, res) => {
    try {
        const { nama_category, tipe } = req.body;
        const id_user = req.user.id_user; 

        
        const category = await categoryService(id_user, nama_category, tipe);

        res.status(201).json({
            status: "success",
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

export const getAllCategory = async (req, res) => {
    try {
        const { id_user } = req.user;  

        const category = await getAllCategoryService(id_user);  

        return res.status(200).json({
            status:"success",
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

export const getCategoryById = async (req, res) => {
    try {
        const { id_category } = req.params;
        const { id_user } = req.user;
        
        const category = await getCategoryByIdService(id_category, id_user);
        
        return res.status(200).json({
            status: "success",
            message:"Berhasil mengambil category",
            data: {
                category
            }
        });
        
    } catch (err) {
        return res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { nama_category, tipe } = req.body;
        const { id_user } = req.user;
        const { id_category } = req.params;

        const category = await updateCategoryService(id_category, id_user, nama_category, tipe);

        return res.status(200).json({
            status: "success",  
            message: "Berhasil update category",
            data: category  
        });
        
    } catch (err) {
        return res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id_user } = req.user;
        const { id_category } = req.params;
    
        
        const category = await deleteCategoryService(id_category, id_user);
        
        res.status(200).json({
            status: "success",
            message: "Category berhasil dihapus",
            data: category
        });
        
    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

