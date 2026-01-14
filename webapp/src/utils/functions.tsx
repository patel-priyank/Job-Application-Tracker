import { notifications } from '@mantine/notifications';

import dayjs from 'dayjs';

import type { ApplicationAction } from '../contexts/ApplicationContext';

export const fetchApplications = async (
  sort: string,
  order: string,
  page: number,
  token: string,
  applicationDispatch: React.Dispatch<ApplicationAction>,
  query?: string
) => {
  let apiUrl = `/api/applications?sort=${sort}&order=${order}&page=${page}`;

  if (query) {
    apiUrl += `&query=${query}`;
  }

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (response.ok) {
    applicationDispatch({
      type: 'SET_APPLICATIONS',
      payload: data.applications
    });

    return data.count;
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
