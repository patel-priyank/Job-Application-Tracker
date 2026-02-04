import { ActionIcon, Card, Group, Indicator, Menu, Stack, Text } from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';

import dayjs from 'dayjs';
import GeoPattern from 'geopattern';

import {
  IconBriefcase2,
  IconDots,
  IconFileText,
  IconPencil,
  IconRoute,
  IconStatusChange,
  IconTrash
} from '@tabler/icons-react';

import type { JobApplication } from '../contexts/ApplicationContext';

import ApplicationDetails from './ApplicationDetails.component';
import CreateApplicationStatus from './CreateApplicationStatus.component';
import DeleteApplication from './DeleteApplication.component';
import EditApplication from './EditApplication.component';

import { APPLICATION_STATUS } from '../utils/constants';
import { formatDate } from '../utils/functions';

const Application = ({ application }: { application: JobApplication }) => {
  const [applicationDetailsOpened, { open: openApplicationDetails, close: closeApplicationDetails }] =
    useDisclosure(false);
  const [createApplicationStatusOpened, { open: openCreateApplicationStatus, close: closeCreateApplicationStatus }] =
    useDisclosure(false);
  const [deleteApplicationOpened, { open: openDeleteApplication, close: closeDeleteApplication }] =
    useDisclosure(false);
  const [editApplicationOpened, { open: openEditApplication, close: closeEditApplication }] = useDisclosure(false);

  return (
    <>
      <ApplicationDetails
        opened={applicationDetailsOpened}
        onClose={closeApplicationDetails}
        application={application}
      />

      <CreateApplicationStatus
        opened={createApplicationStatusOpened}
        onClose={closeCreateApplicationStatus}
        application={application}
      />

      <DeleteApplication opened={deleteApplicationOpened} onClose={closeDeleteApplication} application={application} />

      <EditApplication opened={editApplicationOpened} onClose={closeEditApplication} application={application} />

      <Indicator
        w="100%"
        size={16}
        withBorder
        color={Object.values(APPLICATION_STATUS).find(status => status.label === application.status)?.color}
        disabled={!dayjs(application.history[application.history.length - 1].date).isSame(dayjs(), 'day')}
      >
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
                    onClick={() => setTimeout(openApplicationDetails, 0)}
                  >
                    View details
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconPencil size={16} stroke={1.5} />}
                    onClick={() => setTimeout(openEditApplication, 0)}
                  >
                    Edit application
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconStatusChange size={16} stroke={1.5} />}
                    onClick={() => setTimeout(openCreateApplicationStatus, 0)}
                  >
                    Update status
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    component="a"
                    href={application.link || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    leftSection={<IconRoute size={16} stroke={1.5} />}
                    disabled={!application.link}
                  >
                    Track application
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconTrash size={16} stroke={1.5} />}
                    color="red"
                    onClick={() => setTimeout(openDeleteApplication, 0)}
                  >
                    Delete application
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Text c="dimmed" w="max-content" maw="100%" className="text-with-icon">
              <IconBriefcase2 size={16} stroke={1.5} />
              <Text span truncate="end" title={application?.jobTitle} flex={1}>
                {application.jobTitle}
              </Text>
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
      </Indicator>
    </>
  );
};

export default Application;
