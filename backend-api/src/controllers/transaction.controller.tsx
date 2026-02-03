import axios from 'axios';
import { Request, Response } from 'express';
import { knex } from '../database/knex.js';

export const syncTransactions = async (req: Request, res: Response) => {
    const trx = await knex.transaction();
    try {
        const response = await axios.get('https://apirecycle.unii.co.th/Stock/query-transaction-demo');
        const data = response.data.sellTransaction;

        for (const item of data) {
            const [insertedTransaction] = await trx('transaction')
                .insert({
                    orderId: item.orderId,
                    orderFinishedDate: new Date(`${item.orderFinishedDate} ${item.orderFinishedTime}`),
                    transactionType: "S",
                })
                .returning('id');

            const transactionId = insertedTransaction.id;

            if (item.transactionParties !== null) {
                const customer = {
                    transactionId: transactionId,
                    partiesType: "CM",
                    roleName: item.transactionParties.customer.roleName,
                    name: item.transactionParties.customer.name,
                    idName: item.transactionParties.customer.id,
                }
                await trx('transaction_parties').insert(customer);

                const transport = {
                    transactionId: transactionId,
                    partiesType: "T",
                    roleName: item.transactionParties.transport.roleName,
                    name: item.transactionParties.transport.name,
                    idName: item.transactionParties.transport.id,
                }
                await trx('transaction_parties').insert(transport);


                const collector = {
                    transactionId: transactionId,
                    partiesType: "C",
                    roleName: item.transactionParties.collector.roleName,
                    name: item.transactionParties.collector.name,
                    idName: item.transactionParties.collector.id,
                }
                await trx('transaction_parties').insert(collector);
            }

            for (const categoryItme of item.requestList) {

                const [insertedCat] = await trx('transaction_category')
                    .insert({
                        transactionId: transactionId,
                        categoryId: categoryItme.categoryID,
                        subCategoryId: categoryItme.subCategoryID
                    })
                    .returning('id');

                const transactionCategoryId = insertedCat.id;

                for (const requestItem of categoryItme.requestList) {
                    await trx('transaction_items')
                        .insert({
                            transactionCategoryId: transactionCategoryId,
                            grade: requestItem.grade,
                            price: requestItem.price,
                            quantity: requestItem.quantity,
                            total: requestItem.total
                        });
                }
            }

        }

        await trx.commit();
        res.status(200).json({
            res_code: 200,
            res_message: 'success'
        });

    } catch (error) {
        await trx.rollback();
        res.status(500).json({
            res_code: 500,
            res_message: error instanceof Error ? error.message : 'Internal Server Error',
        });
    }
};