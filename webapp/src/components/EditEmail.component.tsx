import { useEffect, useState } from 'react';

import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import { useAuthContext } from '../hooks/useAuthContext';

import { showNotification } from '../utils/functions';

const EditEmail = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const { user, dispatch: authDispatch } = useAuthContext();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      form.reset();
      form.setValues({
        email: user?.email || ''
      });
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      email: ''
    },
    validate: {
      email: value => {
        if (value.trim().length === 0) {
          return 'Email is required.';
        }

        if (value.trim().length > 256) {
          return 'Email must have at most 256 characters.';
        }

        if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return 'Email must be valid.';
        }

        return null;
      }
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const response = await fetch('/api/users/account/email', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify(values)
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('user', JSON.stringify(data));

      authDispatch({
        type: 'SET_USER',
        payload: data
      });

      showNotification('New inbox vibes', 'Your email address has been updated successfully.', false);

      onClose();
    } else {
      showNotification('Something went wrong', data.error, true);
    }

    setLoading(false);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Email" overlayProps={{ blur: 2 }} centered>
      <form onSubmit={form.onSubmit(values => handleSubmit(values))}>
        <Stack gap="sm">
          <TextInput
            data-autofocus
            label="Email"
            withAsterisk
            placeholder={user?.email}
            key={form.key('email')}
            {...form.getInputProps('email')}
          />

          <Group mt="sm">
            <Button type="submit" loading={loading}>
              Save
            </Button>

            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EditEmail;
