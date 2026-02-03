import axios from 'axios';
import { Request, Response } from 'express';
import { knex } from '../database/knex.js';

export const syncCategories = async (req: Request, res: Response) => {
    try {
        const response = await axios.get('https://apirecycle.unii.co.th/category/query-product-demo');
        const data = response.data.productList;

        const result = data.map((item: any) => ({
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            status: 1
        }));

        await knex('category').insert(result);

        res.status(200).json({
            'res_code': 200,
            'res_message': 'success',
            // 'res_result': result,
        });

    } catch (error) {
        res.status(500).json({
            'res_code': 500,
            'res_message': error instanceof Error ? error.message : 'Internal Server Error',
        });
    }
};

export const syncSubCategories = async (req: Request, res: Response) => {
    try {
        const response = await axios.get('https://apirecycle.unii.co.th/category/query-product-demo');
        const data = response.data.productList;

        // รวม subcategory ทั้งหมด
        const allSubcategories: any[] = [];

        data.forEach((category: any) => {
            category.subcategory.forEach((sub: any) => {
                allSubcategories.push({
                    subCategoryId: sub.subCategoryId,
                    subCategoryName: sub.subCategoryName,
                    categoryId: category.categoryId,
                    status: 1
                });
            });
        });

        await knex('sub_category').insert(allSubcategories);

        res.status(200).json({
            'res_code': 200,
            'res_message': 'success',
            // 'res_result': allSubcategories,
        });
    } catch (error) {
        res.status(500).json({
            'res_code': 500,
            'res_message': error instanceof Error ? error.message : 'Internal Server Error',
        });
    }
};

export const Category = async (req: Request, res: Response) => {
    try {
        
        const data = await knex('category').select('*');

        const result = data.map((item) => ({
            categoryId: item.categoryId,
            categoryName: item.categoryName,
        }));

        res.status(200).json({
            'res_code': 200,
            'res_message': 'success',
            'res_result': result,
        });
    } catch (error) {
        res.status(500).json({
            'res_code': 500,
            'res_message': error instanceof Error ? error.message : 'Internal Server Error',
        });
    }
};

export const subCategory = async (req: Request, res: Response) => {
    const { categoryId } = req.query;
    try {
        const data = await knex('sub_category').select('*').where('categoryId', categoryId as string);

        const result = data.map((item) => ({
            subCategoryId: item.subCategoryId,
            subCategoryName: item.subCategoryName,
        }));

        res.status(200).json({
            'res_code': 200,
            'res_message': 'success',
            'res_result': result,
        });
    } catch (error) {
        res.status(500).json({
            'res_code': 500,
            'res_message': error instanceof Error ? error.message : 'Internal Server Error',
        });
    }
};