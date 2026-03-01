import { notifications } from '@mantine/notifications';

import dayjs from 'dayjs';

import type { ApplicationAction } from '../contexts/ApplicationContext';

import notificationClasses from '../styles/Notification.module.css';

let abortController: AbortController | null = null;

export const fetchApplications = async (
  token: string,
  applicationDispatch: React.Dispatch<ApplicationAction>,
  status: string[],
  emailUsed: string[],
  sort: string,
  order: string,
  pageSize: number,
  page: number,
  query?: string
) => {
  if (status.length === 0 || emailUsed.length === 0) {
    return;
  }

  if (abortController) {
    abortController.abort();
  }

  abortController = new AbortController();

  const { signal } = abortController;

  const fetchApplicationsUrl =
    `/api/applications` +
    `?status=${status.join(',')}` +
    `&emailUsed=${emailUsed.join(',')}` +
    `&sort=${sort}` +
    `&order=${order}` +
    `&pageSize=${pageSize}` +
    `&page=${page}` +
    `${query ? `&query=${query}` : ''}`;

  try {
    const response = await fetch(fetchApplicationsUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal
    });

    const data = await response.json();

    if (!response.ok) {
      return;
    }

    applicationDispatch({
      type: 'SET_APPLICATIONS',
      payload: { applications: data.applications, totalPages: Math.ceil(data.count / pageSize) }
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return;
    }

    console.error(error);
  }
};

export const getNormalizedDate = (date: string | number | Date) => {
  const dateObj = new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
};

export const formatDate = (date: string | Date) => {
  return dayjs(date).format('DD MMM YYYY');
};

export const showNotification = (title: string, message: string, error: boolean) => {
  notifications.clean();

  setTimeout(() => {
    notifications.show({
      title,
      message,
      color: error ? 'red' : 'green',
      position: 'bottom-left',
      classNames: notificationClasses
    });
  }, 250);
};

export const getSortedSuggestedEmails = (suggestedEmails: string[], userEmail: string) => {
  const otherEmails = Array.from(new Set(suggestedEmails.filter(email => email !== userEmail))).sort();
  return [userEmail, ...otherEmails];
};
