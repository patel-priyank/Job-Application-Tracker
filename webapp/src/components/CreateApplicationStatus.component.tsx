import { useEffect, useState } from 'react';

import { Button, Group, Modal, Select, Stack } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';

import dayjs from 'dayjs';

import type { JobApplication } from '../contexts/ApplicationContext';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { APPLICATION_STATUS } from '../utils/constants';
import { fetchApplications, formatDate, getNormalizedDate, showNotification } from '../utils/functions';

const CreateApplicationStatus = ({
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

  useEffect(() => {
    if (opened) {
      form.reset();
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      status: Object.values(APPLICATION_STATUS).find(status => status.default)?.label || '',
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

  const handleSubmit = async (values: typeof form.values) => {
    if (!user) {
      return;
    }

    setLoading(true);

    const date = getNormalizedDate(values.date);

    const response = await fetch(`/api/applications/${application?._id}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ ...values, date })
    });

    const data = await response.json();

    if (!response.ok) {
      showNotification('Something went wrong', data.error, true);

      setLoading(false);

      return;
    }

    await fetchApplications(sort, order, page, user.token, applicationDispatch, searchQuery);

    showNotification('Progress made!', 'The application status has been updated successfully.', false);

    setLoading(false);

    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={application?.companyName} overlayProps={{ blur: 2 }} centered>
      <form onSubmit={form.onSubmit(values => handleSubmit(values))}>
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
            comboboxProps={{ withinPortal: false }}
            maxDropdownHeight={120}
          />

          <DatePickerInput
            label="Date"
            withAsterisk
            placeholder={formatDate(form.values.date)}
            key={form.key('date')}
            {...form.getInputProps('date')}
            valueFormat="DD MMM YYYY"
            minDate={dayjs('2000-01-01').format('YYYY-MM-DD')}
            maxDate={dayjs('2050-12-31').format('YYYY-MM-DD')}
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

export default CreateApplicationStatus;
