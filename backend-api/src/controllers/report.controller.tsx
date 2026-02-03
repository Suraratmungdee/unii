import axios from 'axios';
import { Request, Response } from 'express';
import { knex } from '../database/knex.js';

export const Report = async (req: Request, res: Response) => {
    let { orderFinishedDate, categoryId, subCategoryId, orderId, maxPrice, minPrice, grade, limit, offset } = req.query;
    try {

        const countResult = await knex
            .count('* as total')
            .from(
                knex('transaction AS t')
                    .select('trancat.categoryId', 'trancat.subCategoryId')
                    .leftJoin('transaction_category AS trancat', 'trancat.transactionId', 't.id')
                    .leftJoin('category AS cat', 'cat.categoryId', 'trancat.categoryId')
                    .leftJoin('sub_category AS subcat', 'subcat.subCategoryId', 'trancat.subCategoryId')
                    .leftJoin('transaction_items AS tranitem', 'tranitem.transactionCategoryId', 'trancat.id')
                    .modify(function (queryBuilder) {
                        if (orderFinishedDate) {
                            queryBuilder.whereRaw('DATE("t"."orderFinishedDate") = ?', [orderFinishedDate as string]);
                        }
                        if (categoryId) {
                            queryBuilder.andWhere('cat.categoryId', categoryId as string);
                        }
                        if (subCategoryId) {
                            queryBuilder.andWhere('subcat.subCategoryId', subCategoryId as string);
                        }
                        if (orderId) {
                            queryBuilder.andWhere('t.orderId', 'like', `%${orderId as string}%`);
                        }
                        if (minPrice) {
                            queryBuilder.andWhere('tranitem.price', '>=', minPrice as string);
                        }
                        if (maxPrice) {
                            queryBuilder.andWhere('tranitem.price', '<=', maxPrice as string);
                        }
                        if (grade) {
                            queryBuilder.andWhere('tranitem.grade', grade as string);
                        }
                    })
                    .groupBy('trancat.categoryId', 'trancat.subCategoryId')
                    .havingRaw(`
                        SUM(CASE WHEN "t"."transactionType" = 'B' THEN "tranitem"."price" ELSE 0 END) > 0 OR
                        SUM(CASE WHEN "t"."transactionType" = 'B' THEN CAST("tranitem"."quantity" AS NUMERIC) ELSE 0 END) > 0 OR
                        SUM(CASE WHEN "t"."transactionType" = 'S' THEN "tranitem"."price" ELSE 0 END) > 0 OR
                        SUM(CASE WHEN "t"."transactionType" = 'S' THEN CAST("tranitem"."quantity" AS NUMERIC) ELSE 0 END) > 0
                    `)
                    .as('grouped')
            )
            .first();

        const result = await knex('transaction AS t')
            .select(
                'cat.categoryName',
                'subcat.subCategoryName',
                knex.raw(`SUM(CASE WHEN "t"."transactionType" = 'B' THEN "tranitem"."price" ELSE 0 END) as "buyPrice"`),
                knex.raw(`SUM(CASE WHEN "t"."transactionType" = 'B' THEN CAST("tranitem"."quantity" AS NUMERIC) ELSE 0 END) as "buyQuantity"`),
                knex.raw(`SUM(CASE WHEN "t"."transactionType" = 'S' THEN "tranitem"."price" ELSE 0 END) as "sellPrice"`),
                knex.raw(`SUM(CASE WHEN "t"."transactionType" = 'S' THEN CAST("tranitem"."quantity" AS NUMERIC) ELSE 0 END) as "sellQuantity"`)
            )
            .leftJoin('transaction_category AS trancat', 'trancat.transactionId', 't.id')
            .leftJoin('category AS cat', 'cat.categoryId', 'trancat.categoryId')
            .leftJoin('sub_category AS subcat', 'subcat.subCategoryId', 'trancat.subCategoryId')
            .leftJoin('transaction_items AS tranitem', 'tranitem.transactionCategoryId', 'trancat.id')
            .modify(function (queryBuilder) {
                if (orderFinishedDate) {
                    queryBuilder.whereRaw('DATE("t"."orderFinishedDate") = ?', [orderFinishedDate as string]);
                }
                if (categoryId) {
                    queryBuilder.andWhere('cat.categoryId', categoryId as string);
                }
                if (subCategoryId) {
                    queryBuilder.andWhere('subcat.subCategoryId', subCategoryId as string);
                }
                if (orderId) {
                    queryBuilder.andWhere('t.orderId', 'like', `%${orderId as string}%`);
                }
                if (minPrice) {
                    queryBuilder.andWhere('tranitem.price', '>=', minPrice as string);
                }
                if (maxPrice) {
                    queryBuilder.andWhere('tranitem.price', '<=', maxPrice as string);
                }
                if (grade) {
                    queryBuilder.andWhere('tranitem.grade', grade as string);
                }
            })
            .groupBy('trancat.categoryId', 'trancat.subCategoryId', 'cat.categoryName', 'subcat.subCategoryName')
            .havingRaw(`
                SUM(CASE WHEN "t"."transactionType" = 'B' THEN "tranitem"."price" ELSE 0 END) > 0 OR
                SUM(CASE WHEN "t"."transactionType" = 'B' THEN CAST("tranitem"."quantity" AS NUMERIC) ELSE 0 END) > 0 OR
                SUM(CASE WHEN "t"."transactionType" = 'S' THEN "tranitem"."price" ELSE 0 END) > 0 OR
                SUM(CASE WHEN "t"."transactionType" = 'S' THEN CAST("tranitem"."quantity" AS NUMERIC) ELSE 0 END) > 0
            `)
            .orderBy('trancat.categoryId', 'ASC')
            .offset(offset ? parseInt(offset as string) : 0)
            .limit(limit ? parseInt(limit as string) : 10);

        const res_result = result.map((item) => ({
            categoryName: item.categoryName,
            subCategoryName: item.subCategoryName,
            buyPrice: Number(item.buyPrice),
            buyQuantity: Number(item.buyQuantity),
            sellPrice: Number(item.sellPrice),
            sellQuantity: Number(item.sellQuantity),
            totalPrice: Number(item.buyPrice) - Number(item.sellPrice),
            totalQuantity: Number(item.buyQuantity) - Number(item.sellQuantity),
        }));

        res.status(200).json({
            'res_code': 200,
            'res_message': 'success',
            'res_total': Number(countResult?.total) || 0,
            'data': res_result,
        });

    } catch (error) {
        console.error('Report API Error:', error);
        res.status(500).json({
            'res_code': 500,
            'res_message': error instanceof Error ? error.message : 'Internal Server Error',
        });
    }
};