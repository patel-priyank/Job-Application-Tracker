import { useEffect, useRef, useState } from 'react';

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

import { APPLICATION_STATUS, EMAIL_REGEX, RESEND_COUNTDOWN } from '../utils/constants';
import { fetchApplications, showNotification } from '../utils/functions';

const SignIn = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const { order, page, pageSize, sort, dispatch: applicationDispatch } = useApplicationContext();
  const { dispatch: authDispatch } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COUNTDOWN);
  const [sending, setSending] = useState(false);

  const pinInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (opened) {
      form.reset();
      verificationForm.reset();
      setUserEmail('');
      setCanResend(false);
      setResendCountdown(RESEND_COUNTDOWN);
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
      email: ''
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

      const response = await fetch('/api/users/signin/request', {
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

      setResendCountdown(RESEND_COUNTDOWN);

      setLoading(false);
    }

    setUserEmail(values.email);

    verificationForm.reset();

    modalStack.open('account-verification');

    setTimeout(() => pinInputRef.current?.focus(), 10);
  };

  const handleResendOTP = async () => {
    if (!canResend) {
      return;
    }

    setSending(true);

    const response = await fetch('/api/users/signin/request', {
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

    setResendCountdown(RESEND_COUNTDOWN);

    setSending(false);
  };

  const handleVerifyOTP = async (values: typeof verificationForm.values) => {
    setLoading(true);

    const response = await fetch('/api/users/signin', {
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

    const user = JSON.stringify(data);

    applicationDispatch({
      type: 'SET_FILTERS',
      payload: {
        statusFilter: Object.values(APPLICATION_STATUS).map(status => status.label),
        emailUsedFilter: data.suggestedEmails
      }
    });

    await fetchApplications(
      JSON.parse(user).token,
      applicationDispatch,
      Object.values(APPLICATION_STATUS).map(status => status.label),
      data.suggestedEmails,
      sort,
      order,
      pageSize,
      page
    );

    setTimeout(() => {
      localStorage.setItem('user', user);

      authDispatch({
        type: 'SET_USER',
        payload: data
      });
    }, 300);

    showNotification('Welcome back!', 'You have signed in successfully.', false);

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
        title="Sign In"
        overlayProps={{ blur: 2 }}
        centered
      >
        <form onSubmit={form.onSubmit(values => handleSendOTP(values))}>
          <Text mb="md">
            Enter your email to sign in. We will send a verification code to your email to confirm it's you.
          </Text>

          <Stack gap="sm">
            <TextInput
              data-autofocus
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
        title="Sign In"
        overlayProps={{ blur: 2 }}
        centered
      >
        <form onSubmit={verificationForm.onSubmit(values => handleVerifyOTP(values))}>
          <Text mb="md">
            We've sent a verification code to{' '}
            <Text span fw="500">
              {userEmail}
            </Text>
            . Enter it below to sign in.
          </Text>

          <Text mb="md">
            Need to edit your email?{' '}
            <UnstyledButton c="blue" fw="500" onClick={() => modalStack.close('account-verification')}>
              Go back
            </UnstyledButton>
          </Text>

          <Stack gap="sm">
            <Input.Wrapper label="Verification code" withAsterisk error={verificationForm.errors.verificationCode}>
              <PinInput
                ref={pinInputRef}
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
                  sections={[{ value: (resendCountdown / RESEND_COUNTDOWN) * 100, color: 'blue' }]}
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
                Sign in
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

export default SignIn;
