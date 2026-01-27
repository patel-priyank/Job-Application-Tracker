import { useEffect, useState } from 'react';

import { Button, Group, Modal, PasswordInput, Stack, TextInput } from '@mantine/core';

import { useForm } from '@mantine/form';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { EMAIL_REGEX } from '../utils/constants';
import { fetchApplications, showNotification } from '../utils/functions';

const SignIn = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const { order, page, sort, dispatch: applicationDispatch } = useApplicationContext();
  const { dispatch: authDispatch } = useAuthContext();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      form.reset();
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validate: {
      email: value => {
        if (value.trim().length === 0) {
          return 'Email is required.';
        }

        if (!value.match(EMAIL_REGEX)) {
          return 'Email must be valid.';
        }

        return null;
      },
      password: value => {
        if (value.length === 0) {
          return 'Password is required.';
        }

        return null;
      }
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const response = await fetch('/api/users/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    });

    const data = await response.json();

    if (!response.ok) {
      showNotification('Something went wrong', data.error, true);

      setLoading(false);

      return;
    }

    const user = JSON.stringify(data);

    localStorage.setItem('user', user);

    authDispatch({
      type: 'SET_USER',
      payload: data
    });

    await fetchApplications(sort, order, page, JSON.parse(user).token, applicationDispatch);

    showNotification('Welcome back!', 'You have signed in successfully.', false);

    setLoading(false);

    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Sign In" overlayProps={{ blur: 2 }} centered>
      <form onSubmit={form.onSubmit(values => handleSubmit(values))}>
        <Stack gap="sm">
          <TextInput
            data-autofocus
            label="Email"
            withAsterisk
            placeholder="john.doe@example.com"
            key={form.key('email')}
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label="Password"
            withAsterisk
            placeholder="SecureP@ssw0rd"
            key={form.key('password')}
            {...form.getInputProps('password')}
          />

          <Group mt="sm">
            <Button type="submit" loading={loading}>
              Sign in
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

export default SignIn;
