import { notifications } from '@mantine/notifications';

import dayjs from 'dayjs';

import type { ApplicationAction } from '../contexts/ApplicationContext';

let abortController: AbortController | null = null;

export const fetchApplications = async (
  sort: string,
  order: string,
  page: number,
  token: string,
  applicationDispatch: React.Dispatch<ApplicationAction>,
  query?: string
) => {
  if (abortController) {
    abortController.abort();
  }

  abortController = new AbortController();

  const { signal } = abortController;

  let fetchApplicationsUrl = `/api/applications?sort=${sort}&order=${order}&page=${page}`;

  if (query) {
    fetchApplicationsUrl += `&query=${query}`;
  }

  try {
    const response = await fetch(fetchApplicationsUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal
    });

    const data = await response.json();

    if (response.ok) {
      applicationDispatch({
        type: 'SET_APPLICATIONS',
        payload: data.applications
      });

      return data.count;
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }

    console.error(error);
  }

  return null;
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
      withBorder: true
    });
  }, 250);
};

export const getEmailsUsed = (emailsUsed: string[], userEmail: string) => {
  const otherEmails = Array.from(new Set(emailsUsed.filter(email => email !== userEmail))).sort();
  return [userEmail, ...otherEmails];
};
