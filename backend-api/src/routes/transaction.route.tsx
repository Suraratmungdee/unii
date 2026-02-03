import { Router } from 'express';
import { syncTransactions } from '../controllers/transaction.controller.js';

const router = Router();

router.get('/transaction', syncTransactions);

export default router;