import { useState } from 'react';

import { ActionIcon, Anchor, Button, Group, Modal, Select, Stack, Text, Timeline, useModalsStack } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';

import dayjs from 'dayjs';

import { IconExternalLink, IconPencil, IconTrash } from '@tabler/icons-react';

import type { JobApplication } from '../contexts/ApplicationContext';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { APPLICATION_STATUS } from '../utils/constants';
import { fetchApplications, formatDate, showNotification } from '../utils/functions';

const ApplicationDetails = ({
  opened,
  onClose,
  application
}: {
  opened: boolean;
  onClose: () => void;
  application: JobApplication | null;
}) => {
  const { order, page, searchQuery, sort, dispatch: applicationDispatch } = useApplicationContext();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ _id: string; status: string; date: string } | null>(null);

  const form = useForm({
    initialValues: {
      status: '',
      date: new Date()
    },
    validate: {
      status: value => {
        if (value.trim().length === 0) {
          return 'Status is required.';
        }

        return null;
      },
      date: value => {
        if (!value) {
          return 'Date is required.';
        }

        return null;
      }
    }
  });

  const handleEdit = async (values: typeof form.values) => {
    if (!user) {
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/applications/${application?._id}/status/${status?._id}`, {
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

    await fetchApplications(sort, order, page, user.token, applicationDispatch, searchQuery);

    showNotification('Polished up', 'Your changes have been saved successfully.', false);

    setLoading(false);

    setStatus(null);

    modalStack.close('edit-status');
  };

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/applications/${application?._id}/status/${status?._id}`, {
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

    await fetchApplications(sort, order, page, user.token, applicationDispatch, searchQuery);

    showNotification('Polished up', 'Your changes have been saved successfully.', false);

    setLoading(false);

    setStatus(null);

    modalStack.close('delete-status');
  };

  const modalStack = useModalsStack(['application-details', 'edit-status', 'delete-status']);

  return (
    <Modal.Stack>
      <Modal
        {...modalStack.register('application-details')}
        opened={opened}
        onClose={onClose}
        title={application?.companyName}
        overlayProps={{ blur: 2 }}
        centered
      >
        <Stack gap="md" align="flex-start">
          <Text truncate="end" title={application?.jobTitle} w="100%">
            {application?.jobTitle}
          </Text>

          <Text c="dimmed" truncate="end" title={application?.emailUsed} w="100%">
            {application?.emailUsed}
          </Text>

          <Anchor
            href={application?.link || undefined}
            target="_blank"
            rel="noopener noreferrer"
            underline={application?.link ? 'hover' : 'never'}
            onClick={e => {
              if (!application?.link) {
                e.preventDefault();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--mantine-spacing-xs)',
              ...(application?.link
                ? {}
                : {
                    color: 'var(--mantine-color-disabled-color)',
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  })
            }}
          >
            <IconExternalLink size={16} stroke={1.5} /> Track application
          </Anchor>

          <Timeline bulletSize={16} lineWidth={2} mt="xs">
            {application?.history.map(item => (
              <Timeline.Item
                key={item._id}
                title={item.status}
                c={Object.values(APPLICATION_STATUS).find(status => status.label === item.status)?.color}
              >
                <Text c="dimmed" size="sm" mb="calc(var(--mantine-spacing-xs) / 2)">
                  {formatDate(item.date)}
                </Text>

                <Group gap="xs">
                  <Button
                    variant="light"
                    size="compact-sm"
                    leftSection={<IconPencil size={16} stroke={1.5} />}
                    onClick={() => {
                      form.setValues({
                        status: item.status,
                        date: dayjs(item.date).toDate()
                      });

                      setStatus(item);
                      modalStack.open('edit-status');
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="light"
                    size="compact-sm"
                    color="red"
                    leftSection={<IconTrash size={16} stroke={1.5} />}
                    disabled={application?.history.length === 1}
                    onClick={() => {
                      setStatus(item);
                      modalStack.open('delete-status');
                    }}
                  >
                    Delete
                  </Button>
                </Group>
              </Timeline.Item>
            ))}
          </Timeline>

          <Group mt="sm">
            <Button data-autofocus variant="outline" onClick={onClose}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        {...modalStack.register('edit-status')}
        onClose={() => {
          setStatus(null);
          modalStack.close('edit-status');
        }}
        title={application?.companyName}
        overlayProps={{ blur: 2 }}
        centered
      >
        <form onSubmit={form.onSubmit(values => handleEdit(values))}>
          <Stack gap="sm">
            <Select
              data-autofocus
              label="Status"
              withAsterisk
              key={form.key('status')}
              {...form.getInputProps('status')}
              data={Object.values(APPLICATION_STATUS).map(status => status.label)}
              withAlignedLabels
              allowDeselect={false}
              comboboxProps={{ shadow: 'xl', offset: 0 }}
            />

            <DatePickerInput
              label="Date"
              withAsterisk
              placeholder={formatDate(form.values.date)}
              key={form.key('date')}
              {...form.getInputProps('date')}
              valueFormat="DD MMM YYYY"
              minDate={dayjs('2000-01-01').format('YYYY-MM-DD')}
              maxDate={dayjs().format('YYYY-MM-DD')}
            />

            <Group mt="sm">
              <Button type="submit" loading={loading}>
                Save
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setStatus(null);
                  modalStack.close('edit-status');
                }}
              >
                Cancel
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        {...modalStack.register('delete-status')}
        onClose={() => {
          setStatus(null);
          modalStack.close('delete-status');
        }}
        title={application?.companyName}
        overlayProps={{ blur: 2 }}
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            Are you sure you want to delete the{' '}
            <Text
              component="span"
              c={Object.values(APPLICATION_STATUS).find(s => s.label === status?.status)?.color}
              fw="500"
            >
              {status?.status}
            </Text>{' '}
            update on{' '}
            <Text span style={{ whiteSpace: 'nowrap' }}>
              {formatDate(status?.date ?? '')}
            </Text>
            ? This action cannot be undone.
          </Text>

          <Group mt="sm">
            <Button data-autofocus color="red" loading={loading} onClick={handleDelete}>
              Delete status
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setStatus(null);
                modalStack.close('delete-status');
              }}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Modal.Stack>
  );
};

export default ApplicationDetails;
