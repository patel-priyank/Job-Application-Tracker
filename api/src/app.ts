import express, { NextFunction, Request, Response } from 'express';

import dotenv from 'dotenv';

import applicationRoutes from './routes/application.route';
import userRoutes from './routes/user.route';

import connectDB from './utils/connectDB';

dotenv.config();

const app = express();

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  throw new Error('Environment variables are not defined');
}

app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed: ', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use((req, res, next) => {
  const allowedOrigin = 'https://track-your-jobs.vercel.app';

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use((req: Request, res: Response, next: NextFunction): void => {
  console.log(req.method, req.path);
  next();
});

app.get('/', (req: Request, res: Response): void => {
  res.json({ msg: 'api working' });
});

app.use((req: Request, res: Response, next: NextFunction): void => {
  const min = 200;
  const max = 300;

  setTimeout(next, Math.floor(Math.random() * (max - min + 1)) + min);
});

app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

export default app;
