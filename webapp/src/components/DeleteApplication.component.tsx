import { useState } from 'react';

import { Button, Group, Modal, Stack, Text } from '@mantine/core';

import type { JobApplication } from '../contexts/ApplicationContext';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { fetchApplications, showNotification } from '../utils/functions';

const DeleteApplication = ({
  opened,
  onClose,
  application
}: {
  opened: boolean;
  onClose: () => void;
  application: JobApplication;
}) => {
  const { order, page, searchQuery, sort, dispatch: applicationDispatch } = useApplicationContext();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/applications/${application._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showNotification('Something went wrong', data.error, true);

      setLoading(false);

      return;
    }

    const isLastApplication = user.applicationsCount % Number(import.meta.env.VITE_PAGE_SIZE) === 1;
    const isLastPage = Math.ceil(user.applicationsCount / Number(import.meta.env.VITE_PAGE_SIZE)) === page;

    let newPage = page;

    if (isLastApplication && isLastPage) {
      newPage = page - 1;

      applicationDispatch({
        type: 'SET_PAGE',
        payload: newPage
      });
    }

    await fetchApplications(sort, order, newPage, user.token, applicationDispatch, searchQuery);

    user.applicationsCount--;

    showNotification('Off the list', 'The application has been deleted successfully.', false);

    setLoading(false);

    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Delete Application" overlayProps={{ blur: 2 }} centered>
      <Stack gap="sm">
        <Text size="sm">
          Are you sure you want to delete this application for {application.companyName}? This action cannot be undone.
        </Text>

        <Group mt="sm">
          <Button data-autofocus color="red" loading={loading} onClick={handleDelete}>
            Delete application
          </Button>

          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default DeleteApplication;
