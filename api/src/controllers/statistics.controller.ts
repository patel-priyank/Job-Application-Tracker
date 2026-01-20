import { Request, Response } from 'express';

import Application from '../models/application.model';

const getStatistics = async (req: Request, res: Response) => {
  try {
    const applications = await Application.find({ user: req.user?._id });

    const statusCounts = Array.from(new Set(applications.map(application => application.status))).map(status => ({
      name: status,
      value: applications.filter(application => application.status === status).length
    }));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const weeklyApplications: any[] = [];

    const allStatuses = applications
      .map(application => application.history)
      .flat()
      .map(historyItem => historyItem.status);

    const uniqueStatuses = new Set(allStatuses);

    let weekNumber = 4;

    while (weekNumber--) {
      const end = new Date(today);
      end.setDate(end.getDate() - weekNumber * 7);

      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      const startDate = `${start.getDate().toString().padStart(2, '0')} ${monthNames[start.getMonth()]}`;
      const endDate = `${end.getDate().toString().padStart(2, '0')} ${monthNames[end.getMonth()]}`;
      const label = `${startDate} - ${endDate}`;

      const weekData: any = { label, _start: start, _end: end };
      uniqueStatuses.forEach(status => (weekData[status] = 0));

      weeklyApplications.push(weekData);
    }

    applications.forEach(application => {
      application.history.forEach(historyItem => {
        const itemDate = new Date(historyItem.date);
        const week = weeklyApplications.find(w => itemDate >= w._start && itemDate <= w._end);

        if (week) {
          week[historyItem.status] += 1;
        }
      });
    });

    weeklyApplications.forEach(week => {
      delete week._start;
      delete week._end;

      Object.keys(week).forEach(key => {
        if (week[key] === 0) {
          delete week[key];
        }
      });
    });

    return res.status(200).json({
      statusCounts,
      weeklyApplications
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

export default {
  getStatistics
};
