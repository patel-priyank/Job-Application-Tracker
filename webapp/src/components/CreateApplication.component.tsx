import { useEffect, useState } from 'react';

import { Autocomplete, Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';

import dayjs from 'dayjs';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { APPLICATION_STATUS, EMAIL_REGEX } from '../utils/constants';
import {
  fetchApplications,
  formatDate,
  getNormalizedDate,
  getSortedSuggestedEmails,
  showNotification
} from '../utils/functions';

const CreateApplication = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
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
      companyName: '',
      jobTitle: '',
      emailUsed: '',
      link: '',
      status: Object.values(APPLICATION_STATUS).find(status => status.default)?.label || '',
      date: new Date()
    },
    validate: {
      companyName: value => {
        if (value.trim().length === 0) {
          return 'Company name is required.';
        }

        if (value.trim().length > 128) {
          return 'Company name must have at most 128 characters.';
        }

        return null;
      },
      jobTitle: value => {
        if (value.trim().length === 0) {
          return 'Job title is required.';
        }

        if (value.trim().length > 256) {
          return 'Job title must have at most 256 characters.';
        }

        return null;
      },
      emailUsed: value => {
        if (value.trim().length === 0) {
          return 'Email used is required.';
        }

        if (value.trim().length > 256) {
          return 'Email used must have at most 256 characters.';
        }

        if (!value.match(EMAIL_REGEX)) {
          return 'Email used must be valid.';
        }

        return null;
      },
      link: value => {
        if (value && !value.trim().startsWith('https://') && !value.trim().startsWith('http://')) {
          return 'If provided, link must start with http:// or https://.';
        }

        return null;
      },
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

    const response = await fetch('/api/applications', {
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

    if (!user.suggestedEmails.includes(values.emailUsed)) {
      user.suggestedEmails.push(values.emailUsed);
    }

    user.applicationsCount++;

    showNotification('On the list', 'The application has been added successfully.', false);

    setLoading(false);

    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create Application" overlayProps={{ blur: 2 }} centered>
      <form onSubmit={form.onSubmit(values => handleSubmit(values))}>
        <Stack gap="sm">
          <TextInput
            data-autofocus
            label="Company name"
            withAsterisk
            placeholder="Google"
            key={form.key('companyName')}
            {...form.getInputProps('companyName')}
          />

          <TextInput
            label="Job title"
            withAsterisk
            placeholder="Software Engineer"
            key={form.key('jobTitle')}
            {...form.getInputProps('jobTitle')}
          />

          <Autocomplete
            label="Email used"
            withAsterisk
            description="Email used to apply for the job. Type a new email or select from the list of previously used emails."
            placeholder={user?.email}
            key={form.key('emailUsed')}
            {...form.getInputProps('emailUsed')}
            data={getSortedSuggestedEmails(user?.suggestedEmails || [], user?.email || '')}
            maxDropdownHeight={120}
          />

          <TextInput
            label="Link"
            description="Link to track the job application."
            placeholder="https://careers.google.com/jobs/I1roBwQfiBLbOizI"
            key={form.key('link')}
            {...form.getInputProps('link')}
          />

          <Select
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
              Create application
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

export default CreateApplication;
