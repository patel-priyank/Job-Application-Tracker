import express, { NextFunction, Request, Response } from 'express';

import cors from 'cors';
import dotenv from 'dotenv';

import applicationRoutes from './routes/application.route';
import statisticsRoutes from './routes/statistics.route';
import userRoutes from './routes/user.route';

import connectDB from './utils/connectDB';

dotenv.config();

const app = express();

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  throw new Error('Environment variables are not defined.');
}

app.use(cors());

app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed: ', err);
    res.status(500).json({ error: 'Database connection failed.' });
  }
});

app.use((req: Request, res: Response, next: NextFunction): void => {
  console.log(req.method, req.path);

  next();
});

app.get('/', (req: Request, res: Response): void => {
  res.json({ msg: 'api working' });
});

app.use('/api/users', userRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/applications', applicationRoutes);

export default app;
