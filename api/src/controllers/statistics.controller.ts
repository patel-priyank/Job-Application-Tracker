import { Request, Response } from 'express';

import Application from '../models/application.model';

const getStatistics = async (req: Request, res: Response) => {
  try {
    const applications = await Application.find({ user: req.user?._id });

    const statusCounts = Array.from(new Set(applications.map(application => application.status))).map(status => ({
      name: status,
      value: applications.filter(application => application.status === status).length
    }));

    return res.status(200).json({
      statusCounts
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

export default {
  getStatistics
};
