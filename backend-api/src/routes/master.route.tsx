import { Router } from 'express';
import { syncCategories, syncSubCategories, Category, subCategory } from '../controllers/master.controller.js';

const router = Router();

// router.get('/category', syncCategories);
// router.get('/subcategory', syncSubCategories);
router.get('/category', Category);
router.get('/subcategory', subCategory);

export default router;