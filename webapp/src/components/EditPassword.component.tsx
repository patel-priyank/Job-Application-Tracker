import { useEffect, useState } from 'react';

import { Box, Button, Group, Modal, PasswordInput, Popover, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';

import { IconCheck, IconX } from '@tabler/icons-react';

import { useAuthContext } from '../hooks/useAuthContext';

import { PW_REGEX, PW_SPECIAL_CHARS_REGEX } from '../utils/constants';
import { showNotification } from '../utils/functions';

const PasswordRequirement = ({ meets, label }: { meets: boolean; label: string }) => {
  return (
    <Text c={meets ? 'green' : 'red'} style={{ display: 'flex', alignItems: 'center' }} size="sm">
      {meets ? <IconCheck size={14} stroke={1.5} /> : <IconX size={14} stroke={1.5} />}
      <Box ml={10}>{label}</Box>
    </Text>
  );
};

const pwRequirements = [
  { re: /^.{8,128}$/, label: '8-128 characters' },
  { re: /[A-Z]/, label: 'Uppercase letter' },
  { re: /[a-z]/, label: 'Lowercase letter' },
  { re: /[0-9]/, label: 'Number' },
  { re: PW_SPECIAL_CHARS_REGEX, label: 'Special character' }
];

const EditPassword = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const { user, dispatch: authDispatch } = useAuthContext();

  const [pwPopoverOpened, { open: openPwPopover, close: closePwPopover }] = useDisclosure(false);
  const [pwConfirmPopoverOpened, { open: openPwConfirmPopover, close: closePwConfirmPopover }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      form.reset();
      closePwPopover();
      closePwConfirmPopover();
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      pwConfirmation: ''
    },
    validate: {
      currentPassword: value => {
        if (value.length === 0) {
          return 'Current password is required.';
        }

        return null;
      },
      newPassword: value => {
        if (value.length === 0) {
          return 'New password is required.';
        }

        if (value.length < 8) {
          return 'New password must have at least 8 characters.';
        }

        if (value.length > 128) {
          return 'New password must have at most 128 characters.';
        }

        if (!value.match(PW_REGEX)) {
          return 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
        }

        return null;
      },
      pwConfirmation: value => {
        if (value.length === 0) {
          return 'Password confirmation is required.';
        }

        if (value !== form.values.newPassword) {
          return 'Passwords do not match.';
        }

        return null;
      }
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const response = await fetch('/api/users/account/password', {
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

      showNotification('All secure!', 'Your password has been updated successfully.', false);

      onClose();
    } else {
      showNotification('Something went wrong', data.error, true);
    }

    setLoading(false);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Password" overlayProps={{ blur: 2 }} centered>
      <form onSubmit={form.onSubmit(values => handleSubmit(values))}>
        <Stack gap="sm">
          <PasswordInput
            data-autofocus
            label="Current password"
            withAsterisk
            placeholder="SecureP@ssw0rd"
            key={form.key('currentPassword')}
            {...form.getInputProps('currentPassword')}
          />

          <Popover opened={pwPopoverOpened} position="bottom" width="target" transitionProps={{ transition: 'pop' }}>
            <Popover.Target>
              <PasswordInput
                label="New password"
                withAsterisk
                description="Must be 8-128 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
                placeholder="SecureP@ssw0rd"
                key={form.key('newPassword')}
                {...form.getInputProps('newPassword')}
                onFocusCapture={openPwPopover}
                onBlurCapture={closePwPopover}
              />
            </Popover.Target>

            <Popover.Dropdown>
              <Stack gap="xs">
                {pwRequirements.map((requirement, index) => (
                  <PasswordRequirement
                    key={index}
                    label={requirement.label}
                    meets={requirement.re.test(form.values.newPassword)}
                  />
                ))}
              </Stack>
            </Popover.Dropdown>
          </Popover>

          <Popover
            opened={pwConfirmPopoverOpened}
            position="bottom"
            width="target"
            transitionProps={{ transition: 'pop' }}
          >
            <Popover.Target>
              <PasswordInput
                label="Confirm new password"
                withAsterisk
                placeholder="SecureP@ssw0rd"
                key={form.key('pwConfirmation')}
                {...form.getInputProps('pwConfirmation')}
                onFocusCapture={openPwConfirmPopover}
                onBlurCapture={closePwConfirmPopover}
              />
            </Popover.Target>

            <Popover.Dropdown>
              <PasswordRequirement
                label="Passwords match"
                meets={form.values.newPassword === form.values.pwConfirmation}
              />
            </Popover.Dropdown>
          </Popover>

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

export default EditPassword;
