import { useEffect, useRef, useState } from 'react';

import { Alert, Button, Group, Input, Modal, PinInput, RingProgress, Stack, Text, useModalsStack } from '@mantine/core';

import { useForm } from '@mantine/form';

import { IconAlertTriangle } from '@tabler/icons-react';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { RESEND_COUNTDOWN } from '../utils/constants';
import { showNotification } from '../utils/functions';

const DeleteApplications = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const { dispatch: applicationDispatch } = useApplicationContext();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COUNTDOWN);
  const [sending, setSending] = useState(false);

  const pinInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (opened) {
      verificationForm.reset();
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

  const handleSendOTP = async () => {
    if (!user) {
      return;
    }

    setLoading(true);

    const response = await fetch('/api/applications/delete/request', {
      method: 'POST',
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

    setCanResend(false);

    setResendCountdown(RESEND_COUNTDOWN);

    setLoading(false);

    verificationForm.reset();

    modalStack.open('delete-applications-verification');

    setTimeout(() => pinInputRef.current?.focus(), 10);
  };

  const handleResendOTP = async () => {
    if (!canResend || !user) {
      return;
    }

    setSending(true);

    const response = await fetch('/api/applications/delete/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      }
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
    if (!user) {
      return;
    }

    setLoading(true);

    const response = await fetch('/api/applications', {
      method: 'DELETE',
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

    applicationDispatch({
      type: 'SET_APPLICATIONS',
      payload: {
        applications: [],
        totalPages: 0
      }
    });

    user.applicationsCount = 0;

    showNotification(
      'Cleanup complete',
      'All job applications have been permanently deleted from your account.',
      false
    );

    setLoading(false);

    handleClose();
  };

  const modalStack = useModalsStack(['delete-applications', 'delete-applications-verification']);

  return (
    <Modal.Stack>
      <Modal
        {...modalStack.register('delete-applications')}
        opened={opened}
        onClose={handleClose}
        title="Delete Applications"
        overlayProps={{ blur: 2 }}
        centered
      >
        <Text c="dimmed" mb="md">
          This action will permanently delete all your job applications and their associated history. We will send a
          verification code to your email to confirm it's you.
        </Text>

        <Stack gap="sm">
          <Alert variant="light" color="red" icon={<IconAlertTriangle />}>
            This action cannot be undone.
          </Alert>

          <Group mt="sm">
            <Button data-autofocus onClick={handleSendOTP} loading={loading}>
              Send code
            </Button>

            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        {...modalStack.register('delete-applications-verification')}
        onClose={handleClose}
        title="Delete Applications"
        overlayProps={{ blur: 2 }}
        centered
      >
        <form onSubmit={verificationForm.onSubmit(values => handleVerifyOTP(values))}>
          <Stack gap="sm">
            <Text>
              We've sent a verification code to{' '}
              <Text span fw="500">
                {user?.email}
              </Text>
              . Enter it below to confirm permanent deletion of your job applications.
            </Text>

            <Alert variant="light" color="red" icon={<IconAlertTriangle />}>
              Deleted applications cannot be recovered.
            </Alert>

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
              <Button
                color="red"
                type="submit"
                loading={loading}
                disabled={verificationForm.values.verificationCode.length !== 6}
              >
                Delete applications
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

export default DeleteApplications;
