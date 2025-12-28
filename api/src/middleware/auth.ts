import { NextFunction, Request, Response } from 'express';

import jwt, { JwtPayload } from 'jsonwebtoken';

import User from '../models/user.model';

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing or invalid' });
  }

  const jwtPayload = jwt.verify(authorization.split(' ')[1], process.env.JWT_SECRET || '');

  if (typeof jwtPayload === 'string' || !('_id' in jwtPayload)) {
    return res.status(403).json({ error: 'Invalid or expired authorization token' });
  }

  try {
    const { _id } = jwtPayload as JwtPayload & { _id: string };

    const user = await User.findById(_id).select('_id emailsUsed');

    if (!user) {
      return res.status(401).json({ error: 'User associated with token not found' });
    }

    req.user = user;

    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export default requireAuth;
