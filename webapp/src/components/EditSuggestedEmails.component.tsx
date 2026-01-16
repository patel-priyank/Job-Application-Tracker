import { useEffect, useState } from 'react';

import { ActionIcon, Button, Group, Modal, Popover, Skeleton, Stack, Text } from '@mantine/core';

import { IconArrowBackUp, IconInfoCircle, IconTrash } from '@tabler/icons-react';

import { useAuthContext } from '../hooks/useAuthContext';

import { getSortedSuggestedEmails, showNotification } from '../utils/functions';

const EditSuggestedEmails = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const { user, dispatch: authDispatch } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [suggestedEmails, setSuggestedEmails] = useState({} as { [key: string]: boolean });
  const [emailsToDelete, setEmailsToDelete] = useState([] as string[]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opened) {
      setLoading(true);

      setSuggestedEmails(
        getSortedSuggestedEmails(user?.suggestedEmails || [], user?.email || '').reduce((acc, email) => {
          acc[email] = true;
          return acc;
        }, {} as { [key: string]: boolean })
      );

      setEmailsToDelete([]);
      setSaving(false);

      setDeletableSuggestedEmails();
    }
  }, [opened]);

  const setDeletableSuggestedEmails = async () => {
    const response = await fetch('/api/users/emails-in-use', {
      headers: {
        Authorization: `Bearer ${user?.token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      const updatedEmails = getSortedSuggestedEmails(user?.suggestedEmails || [], user?.email || '').reduce(
        (acc, email) => {
          acc[email] = true;
          return acc;
        },
        {} as { [key: string]: boolean }
      );

      Object.keys(updatedEmails).forEach(email => {
        updatedEmails[email] = !(data.emailsInUse.includes(email) || email === user?.email);
      });

      setSuggestedEmails(updatedEmails);

      setLoading(false);
    } else {
      showNotification('Something went wrong', data.error, true);

      onClose();
    }
  };

  const handleSubmit = async () => {
    setSaving(true);

    const response = await fetch('/api/users/account/suggested-emails', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify({ emailsToDelete })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('user', JSON.stringify(data));

      authDispatch({
        type: 'SET_USER',
        payload: data
      });

      showNotification('Tidied up', 'Your suggested emails have been updated successfully.', false);

      onClose();
    } else {
      showNotification('Something went wrong', data.error, true);
    }

    setSaving(false);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Suggested Emails" overlayProps={{ blur: 2 }} centered>
      <Text c="dimmed" mb="md">
        These emails were previously used to create job applications, and are suggested when creating or editing a job
        application.
      </Text>

      <Stack gap="sm">
        <Stack>
          {Object.keys(suggestedEmails).map(email => (
            <Group key={email} justify="space-between" wrap="nowrap">
              {loading ? (
                <Skeleton h={28} />
              ) : (
                <Text truncate="end" title={email} c={emailsToDelete.includes(email) ? 'red' : undefined}>
                  {email}
                </Text>
              )}

              {!loading && (
                <Group gap="xs" wrap="nowrap">
                  {(email === user?.email || !suggestedEmails[email]) && (
                    <Popover width={240} shadow="xs">
                      <Popover.Target>
                        <ActionIcon variant="subtle">
                          <IconInfoCircle size={16} stroke={1.5} />
                        </ActionIcon>
                      </Popover.Target>

                      <Popover.Dropdown>
                        <Text size="sm">
                          {email === user?.email
                            ? 'This is the primary email for the account and cannot be removed.'
                            : 'This email is currently used in one or more job applications, and cannot be removed.'}
                        </Text>
                      </Popover.Dropdown>
                    </Popover>
                  )}

                  {emailsToDelete.includes(email) ? (
                    <ActionIcon
                      variant="light"
                      onClick={() => setEmailsToDelete(prev => prev.filter(e => e !== email))}
                    >
                      <IconArrowBackUp size={16} stroke={1.5} />
                    </ActionIcon>
                  ) : (
                    <ActionIcon
                      variant="light"
                      color="red"
                      disabled={email === user?.email || !suggestedEmails[email]}
                      onClick={() => setEmailsToDelete(prev => [...prev, email])}
                    >
                      <IconTrash size={16} stroke={1.5} />
                    </ActionIcon>
                  )}
                </Group>
              )}
            </Group>
          ))}
        </Stack>

        <Group mt="sm">
          <Button data-autofocus loading={saving} onClick={handleSubmit}>
            Save
          </Button>

          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditSuggestedEmails;
