import { Router } from 'express';
import { Report } from '../controllers/report.controller.js';

const router = Router();

router.get('/report', Report);

export default router;