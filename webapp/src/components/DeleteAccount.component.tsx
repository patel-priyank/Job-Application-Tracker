import { useEffect, useState } from 'react';

import { Alert, Button, Group, Modal, PasswordInput, Stack, Text, useModalsStack } from '@mantine/core';
import { useForm } from '@mantine/form';

import { IconAlertTriangle } from '@tabler/icons-react';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { showNotification } from '../utils/functions';

const DeleteAccount = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const { dispatch: applicationDispatch } = useApplicationContext();
  const { user, dispatch: authDispatch } = useAuthContext();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      form.reset();
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      password: ''
    },
    validate: {
      password: value => {
        if (value.length === 0) {
          return 'Password is required.';
        }

        return null;
      }
    }
  });

  const close = () => {
    modalStack.closeAll();
    onClose();
  };

  const handleDelete = async (values: typeof form.values) => {
    setLoading(true);

    const response = await fetch('/api/users/account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify(values)
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.removeItem('user');

      applicationDispatch({
        type: 'SET_APPLICATIONS',
        payload: []
      });

      authDispatch({
        type: 'SET_USER',
        payload: null
      });

      showNotification('Goodbye!', 'Your account and all associated data have been permanently deleted.', false);

      close();
    } else {
      showNotification('Something went wrong', data.error, true);
    }

    setLoading(false);
  };

  const modalStack = useModalsStack(['delete-account', 'delete-account-confirmation']);

  return (
    <Modal.Stack>
      <Modal
        {...modalStack.register('delete-account')}
        opened={opened}
        onClose={close}
        title="Delete Account"
        overlayProps={{ blur: 2 }}
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            This action will permanently delete your account and all data related to your job applications.
          </Text>

          <Alert variant="light" color="red" icon={<IconAlertTriangle />}>
            This action cannot be undone.
          </Alert>

          <Group mt="sm">
            <Button data-autofocus color="red" onClick={() => modalStack.open('delete-account-confirmation')}>
              Continue
            </Button>

            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        {...modalStack.register('delete-account-confirmation')}
        onClose={close}
        title="Delete Account"
        overlayProps={{ blur: 2 }}
        centered
      >
        <form onSubmit={form.onSubmit(values => handleDelete(values))}>
          <Stack gap="sm">
            <Text size="sm">
              This action cannot be undone. Enter your password to confirm permanent deletion of your account.
            </Text>

            <Alert variant="light" color="red" icon={<IconAlertTriangle />}>
              Account deletion is immediate and irreversible.
            </Alert>

            <PasswordInput
              data-autofocus
              label="Password"
              withAsterisk
              placeholder="SecureP@ssw0rd"
              key={form.key('password')}
              {...form.getInputProps('password')}
            />

            <Group mt="sm">
              <Button color="red" type="submit" loading={loading} disabled={form.values.password.length === 0}>
                Delete account
              </Button>

              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Modal.Stack>
  );
};

export default DeleteAccount;
