import { notifications } from '@mantine/notifications';

import dayjs from 'dayjs';

import type { ApplicationAction } from '../contexts/ApplicationContext';

export const fetchApplications = async (user: string, dispatch: React.Dispatch<ApplicationAction>) => {
  const response = await fetch('/api/applications', {
    headers: {
      Authorization: `Bearer ${JSON.parse(user).token}`
    }
  });

  const data = await response.json();

  if (response.ok) {
    dispatch({
      type: 'SET_APPLICATIONS',
      payload: data
    });
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
      withBorder: true
    });
  }, 250);
};
