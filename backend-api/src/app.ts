import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import masterRoute from './routes/master.route.js';
import transactionRoute from './routes/transaction.route.js';
import reportRoute from './routes/report.route.js';

const app = express();

// --- Middlewares ---
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
process.env.NODE_ENV === 'development' ? app.use(morgan('dev')) : app.use(morgan('combined'));

// --- Routes ---
app.use('/api', masterRoute);
app.use('/api', transactionRoute);
app.use('/api', reportRoute);

export default app;