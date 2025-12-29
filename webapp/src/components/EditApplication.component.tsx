import { useEffect, useState } from 'react';

import { Autocomplete, Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import type { JobApplication } from '../contexts/ApplicationContext';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import { EMAIL_REGEX } from '../utils/constants';
import { showNotification } from '../utils/functions';

const EditApplication = ({
  opened,
  onClose,
  application
}: {
  opened: boolean;
  onClose: () => void;
  application: JobApplication | null;
}) => {
  const { dispatch: applicationDispatch } = useApplicationContext();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      form.reset();
      form.setValues({
        companyName: application?.companyName || '',
        jobTitle: application?.jobTitle || '',
        emailUsed: application?.emailUsed || '',
        link: application?.link || ''
      });
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      companyName: '',
      jobTitle: '',
      emailUsed: '',
      link: ''
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
      }
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const response = await fetch(`/api/applications/${application?._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify(values)
    });

    const data = await response.json();

    if (response.ok) {
      if (!user?.emailsUsed.includes(values.emailUsed)) {
        user?.emailsUsed.push(values.emailUsed);
      }

      applicationDispatch({
        type: 'UPDATE_APPLICATION',
        payload: data
      });

      showNotification('Polished up', 'Your changes have been saved successfully.', false);

      onClose();
    } else {
      showNotification('Something went wrong', data.error, true);
    }

    setLoading(false);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Application" overlayProps={{ blur: 2 }} centered>
      <form onSubmit={form.onSubmit(values => handleSubmit(values))}>
        <Stack gap="sm">
          <TextInput
            data-autofocus
            label="Company name"
            withAsterisk
            placeholder={application?.companyName}
            key={form.key('companyName')}
            {...form.getInputProps('companyName')}
          />

          <TextInput
            label="Job title"
            withAsterisk
            placeholder={application?.jobTitle}
            key={form.key('jobTitle')}
            {...form.getInputProps('jobTitle')}
          />

          <Autocomplete
            label="Email used"
            withAsterisk
            description="The email used to apply for the job. Type a new email or select from the list of previously used emails."
            placeholder={user?.email}
            key={form.key('emailUsed')}
            {...form.getInputProps('emailUsed')}
            data={user?.emailsUsed}
            maxDropdownHeight={120}
          />

          <TextInput
            label="Link"
            placeholder={application?.link || 'https://careers.google.com/jobs/I1roBwQfiBLbOizI'}
            key={form.key('link')}
            {...form.getInputProps('link')}
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

export default EditApplication;
