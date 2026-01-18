import { useEffect, useState } from 'react';

import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import { useAuthContext } from '../hooks/useAuthContext';

import { showNotification } from '../utils/functions';

const EditName = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const { user, dispatch: authDispatch } = useAuthContext();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      form.reset();
      form.setValues({
        name: user?.name || ''
      });
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      name: ''
    },
    validate: {
      name: value => {
        if (value.trim().length === 0) {
          return 'Name is required.';
        }

        if (value.trim().length > 128) {
          return 'Name must have at most 128 characters.';
        }

        return null;
      }
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!user) {
      return;
    }

    setLoading(true);

    const response = await fetch('/api/users/account/name', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(values)
    });

    const data = await response.json();

    if (!response.ok) {
      showNotification('Something went wrong', data.error, true);

      setLoading(false);

      return;
    }

    localStorage.setItem('user', JSON.stringify(data));

    authDispatch({
      type: 'SET_USER',
      payload: data
    });

    showNotification('Fresh identity', 'Your name has been updated successfully.', false);

    setLoading(false);

    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Name" overlayProps={{ blur: 2 }} centered>
      <form onSubmit={form.onSubmit(values => handleSubmit(values))}>
        <Stack gap="sm">
          <TextInput
            data-autofocus
            label="Name"
            withAsterisk
            placeholder={user?.name}
            key={form.key('name')}
            {...form.getInputProps('name')}
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

export default EditName;
