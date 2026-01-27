import { ActionIcon, Card, Group, Menu, Stack, Text } from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';

import GeoPattern from 'geopattern';

import { IconDots, IconExternalLink, IconFileText, IconPencil, IconStatusChange, IconTrash } from '@tabler/icons-react';

import type { JobApplication } from '../contexts/ApplicationContext';

import ApplicationDetails from './ApplicationDetails.component';
import CreateApplicationStatus from './CreateApplicationStatus.component';
import DeleteApplication from './DeleteApplication.component';
import EditApplication from './EditApplication.component';

import { APPLICATION_STATUS } from '../utils/constants';
import { formatDate } from '../utils/functions';

const Application = ({ application }: { application: JobApplication }) => {
  const [appDetailsOpened, { open: openAppDetails, close: closeAppDetails }] = useDisclosure(false);
  const [createAppStatusOpened, { open: openCreateAppStatus, close: closeCreateAppStatus }] = useDisclosure(false);
  const [deleteAppOpened, { open: openDeleteApp, close: closeDeleteApp }] = useDisclosure(false);
  const [editAppOpened, { open: openEditApp, close: closeEditApp }] = useDisclosure(false);

  return (
    <>
      <ApplicationDetails opened={appDetailsOpened} onClose={closeAppDetails} application={application} />

      <CreateApplicationStatus
        opened={createAppStatusOpened}
        onClose={closeCreateAppStatus}
        application={application}
      />

      <DeleteApplication opened={deleteAppOpened} onClose={closeDeleteApp} application={application} />

      <EditApplication opened={editAppOpened} onClose={closeEditApp} application={application} />

      <Card padding="md" shadow="md" radius="md" withBorder h="100%">
        <Card.Section h={140} bg={GeoPattern.generate(application.companyName).toDataUrl()} />

        <Stack gap="xs" mt="md">
          <Group justify="space-between" wrap="nowrap">
            <Text truncate="end" title={application.companyName}>
              {application.companyName}
            </Text>

            <Menu withinPortal position="bottom-end" shadow="xl">
              <Menu.Target>
                <ActionIcon variant="light" color="gray">
                  <IconDots size={16} stroke={1.5} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconFileText size={16} stroke={1.5} />}
                  onClick={() => setTimeout(openAppDetails, 0)}
                >
                  View details
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  leftSection={<IconPencil size={16} stroke={1.5} />}
                  onClick={() => setTimeout(openEditApp, 0)}
                >
                  Edit application
                </Menu.Item>

                <Menu.Item
                  leftSection={<IconStatusChange size={16} stroke={1.5} />}
                  onClick={() => setTimeout(openCreateAppStatus, 0)}
                >
                  Update status
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  component="a"
                  href={application.link || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  leftSection={<IconExternalLink size={16} stroke={1.5} />}
                  disabled={!application.link}
                >
                  Track application
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  leftSection={<IconTrash size={16} stroke={1.5} />}
                  color="red"
                  onClick={() => setTimeout(openDeleteApp, 0)}
                >
                  Delete application
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          <Text c="dimmed" truncate="end" title={application.jobTitle}>
            {application.jobTitle}
          </Text>

          <Stack gap={0}>
            <Text
              c={Object.values(APPLICATION_STATUS).find(status => status.label === application.status)?.color}
              size="sm"
              fw="500"
            >
              {application.status}
            </Text>

            <Text c="dimmed" size="sm">
              {formatDate(application.date)}
            </Text>
          </Stack>
        </Stack>
      </Card>
    </>
  );
};

export default Application;
