import { useEffect, useState } from 'react';

import {
  Button,
  Group,
  Input,
  Modal,
  PinInput,
  RingProgress,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
  useModalsStack
} from '@mantine/core';

import { useForm } from '@mantine/form';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { APPLICATION_STATUS, EMAIL_REGEX } from '../utils/constants';
import { showNotification } from '../utils/functions';

const SignUp = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const { dispatch: applicationDispatch } = useApplicationContext();
  const { dispatch: authDispatch } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (opened) {
      form.reset();
      verificationForm.reset();
      setUserEmail('');
      setCanResend(false);
      setResendCountdown(60);
    }
  }, [opened]);

  useEffect(() => {
    if (!canResend && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
  }, [canResend, resendCountdown]);

  const form = useForm({
    initialValues: {
      name: '',
      email: ''
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
      },
      email: value => {
        if (value.trim().length === 0) {
          return 'Email is required.';
        }

        if (value.trim().length > 256) {
          return 'Email must have at most 256 characters.';
        }

        if (!value.match(EMAIL_REGEX)) {
          return 'Email must be valid.';
        }

        return null;
      }
    }
  });

  const verificationForm = useForm({
    initialValues: {
      verificationCode: ''
    },
    validate: {
      verificationCode: value => {
        if (value.length !== 6) {
          return 'Verification code must be 6 digits.';
        }

        return null;
      }
    }
  });

  const handleClose = () => {
    modalStack.closeAll();
    onClose();
  };

  const handleSendOTP = async (values: typeof form.values) => {
    if (userEmail !== values.email) {
      setLoading(true);

      const response = await fetch('/api/users/signup/send-otp', {
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

      setCanResend(false);

      setResendCountdown(60);

      setLoading(false);
    }

    setUserEmail(values.email);

    verificationForm.reset();

    modalStack.open('account-verification');
  };

  const handleResendOTP = async () => {
    if (!canResend) {
      return;
    }

    setSending(true);

    const response = await fetch('/api/users/signup/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.values)
    });

    const data = await response.json();

    if (!response.ok) {
      showNotification('Something went wrong', data.error, true);

      setSending(false);

      return;
    }

    showNotification('Verification code resent', 'A new verification code has been sent to your email.', false);

    setCanResend(false);

    setResendCountdown(60);

    setSending(false);
  };

  const handleVerifyOTP = async (values: typeof verificationForm.values) => {
    setLoading(true);

    const response = await fetch('/api/users/signup/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: userEmail, ...values })
    });

    const data = await response.json();

    if (!response.ok) {
      showNotification('Something went wrong', data.error, true);

      setLoading(false);

      return;
    }

    applicationDispatch({
      type: 'SET_FILTERS',
      payload: {
        statusFilter: Object.values(APPLICATION_STATUS).map(status => status.label),
        emailUsedFilter: data.suggestedEmails
      }
    });

    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify(data));

      authDispatch({
        type: 'SET_USER',
        payload: data
      });
    }, 300);

    showNotification("You're in!", 'Your account has been created successfully.', false);

    setLoading(false);

    handleClose();
  };

  const modalStack = useModalsStack(['account-details', 'account-verification']);

  return (
    <Modal.Stack>
      <Modal
        {...modalStack.register('account-details')}
        opened={opened}
        onClose={handleClose}
        title="Sign Up"
        overlayProps={{ blur: 2 }}
        centered
      >
        <form onSubmit={form.onSubmit(values => handleSendOTP(values))}>
          <Text c="dimmed" mb="md">
            Enter your name and email to create an account. We will send a verification code to your email to verify
            your identity.
          </Text>

          <Stack gap="sm">
            <TextInput
              data-autofocus
              label="Name"
              withAsterisk
              placeholder="John Doe"
              key={form.key('name')}
              {...form.getInputProps('name')}
            />

            <TextInput
              label="Email"
              withAsterisk
              placeholder="john.doe@example.com"
              key={form.key('email')}
              {...form.getInputProps('email')}
            />

            <Group mt="sm">
              <Button type="submit" loading={loading}>
                Send code
              </Button>

              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        {...modalStack.register('account-verification')}
        onClose={handleClose}
        title="Sign Up"
        overlayProps={{ blur: 2 }}
        centered
      >
        <form onSubmit={verificationForm.onSubmit(values => handleVerifyOTP(values))}>
          <Text c="dimmed" mb="md">
            We've sent a verification code to{' '}
            <Text span fw="500">
              {userEmail}
            </Text>
            . Enter it below to complete your sign up.
          </Text>

          <Text c="dimmed" mb="md">
            Need to edit your name or email?{' '}
            <UnstyledButton c="blue" fw="500" onClick={() => modalStack.close('account-verification')}>
              Go back
            </UnstyledButton>
          </Text>

          <Stack gap="sm">
            <Input.Wrapper label="Verification code" withAsterisk error={verificationForm.errors.verificationCode}>
              <PinInput
                gap={4}
                type="number"
                length={6}
                value={verificationForm.values.verificationCode}
                onChange={value => verificationForm.setFieldValue('verificationCode', value)}
                error={!!verificationForm.errors.verificationCode}
              />
            </Input.Wrapper>

            <Group>
              <Button variant="light" onClick={handleResendOTP} loading={sending} disabled={!canResend || loading}>
                Resend code
              </Button>

              {!canResend && (
                <RingProgress
                  sections={[{ value: (resendCountdown / 60) * 100, color: 'blue' }]}
                  size={36}
                  thickness={2}
                  transitionDuration={250}
                  label={
                    <Text size="xs" ta="center" className="monospace">
                      {resendCountdown}
                    </Text>
                  }
                />
              )}
            </Group>

            <Group mt="sm">
              <Button type="submit" loading={loading}>
                Sign up
              </Button>

              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Modal.Stack>
  );
};

export default SignUp;
