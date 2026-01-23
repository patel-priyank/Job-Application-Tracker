import { Request, Response } from 'express';

import Application from '../models/application.model';

const getStatistics = async (req: Request, res: Response) => {
  try {
    const applications = await Application.find({ user: req.user?._id });

    const statusCounts = Array.from(new Set(applications.map(application => application.status))).map(status => ({
      label: status,
      value: applications.filter(application => application.status === status).length
    }));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const allStatuses = applications
      .map(application => application.history)
      .flat()
      .map(historyItem => historyItem.status);

    const uniqueStatuses = new Set(allStatuses);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const currentWeekStart = new Date(today);
    const currentDay = currentWeekStart.getDay();
    const diff = currentWeekStart.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    currentWeekStart.setDate(diff);
    currentWeekStart.setHours(0, 0, 0, 0);

    const weeklyActivity: any[] = [];

    let weekNumber = 4;

    while (weekNumber--) {
      const start = new Date(currentWeekStart);
      start.setDate(start.getDate() - weekNumber * 7);

      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const startDate = `${start.getDate().toString().padStart(2, '0')} ${monthNames[start.getMonth()]}`;
      const endDate = `${end.getDate().toString().padStart(2, '0')} ${monthNames[end.getMonth()]}`;
      const label = `${startDate} - ${endDate}`;

      const weekData: any = { label, _start: start, _end: end };
      uniqueStatuses.forEach(status => (weekData[status] = 0));

      weeklyActivity.push(weekData);
    }

    applications.forEach(application => {
      application.history.forEach(historyItem => {
        const itemDate = new Date(historyItem.date);
        const week = weeklyActivity.find(w => itemDate >= w._start && itemDate <= w._end);

        if (week) {
          week[historyItem.status] += 1;
        }
      });
    });

    weeklyActivity.forEach(week => {
      delete week._start;
      delete week._end;

      Object.keys(week).forEach(key => {
        if (week[key] === 0) {
          delete week[key];
        }
      });
    });

    const monthlyActivity: any[] = [];

    let monthNumber = 6;

    while (monthNumber--) {
      const targetDate = new Date(today);
      targetDate.setDate(1);
      targetDate.setMonth(targetDate.getMonth() - monthNumber);

      const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);

      const label = `${monthNames[start.getMonth()]} ${start.getFullYear()}`;

      const monthData: any = { label, _start: start, _end: end };
      uniqueStatuses.forEach(status => (monthData[status] = 0));

      monthlyActivity.push(monthData);
    }

    applications.forEach(application => {
      application.history.forEach(historyItem => {
        const itemDate = new Date(historyItem.date);
        const month = monthlyActivity.find(m => itemDate >= m._start && itemDate <= m._end);

        if (month) {
          month[historyItem.status] += 1;
        }
      });
    });

    monthlyActivity.forEach(month => {
      delete month._start;
      delete month._end;

      Object.keys(month).forEach(key => {
        if (month[key] === 0) {
          delete month[key];
        }
      });
    });

    return res.status(200).json({
      statusCounts,
      weeklyActivity,
      monthlyActivity
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

export default {
  getStatistics
};
