import { useRef } from 'react';

import { ActionIcon, Badge, Box, Card, Group, Highlight, Menu, Skeleton, Stack, Text } from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';

import dayjs from 'dayjs';
import GeoPattern from 'geopattern';

import { IconDots, IconFileText, IconPencil, IconStatusChange, IconTrash } from '@tabler/icons-react';

import type { JobApplication } from '../contexts/ApplicationContext';

import ApplicationDetails from './ApplicationDetails.component';
import CreateApplicationStatus from './CreateApplicationStatus.component';
import DeleteApplication from './DeleteApplication.component';
import EditApplication from './EditApplication.component';

import { APPLICATION_STATUS } from '../utils/constants';
import { formatDate } from '../utils/functions';

import 'animate.css';

const Application = ({
  application,
  highlight,
  loading = false
}: {
  application: JobApplication;
  highlight: string;
  loading?: boolean;
}) => {
  const boxRef = useRef<HTMLDivElement>(null);

  const [applicationDetailsOpened, { open: openApplicationDetails, close: closeApplicationDetails }] =
    useDisclosure(false);
  const [createApplicationStatusOpened, { open: openCreateApplicationStatus, close: closeCreateApplicationStatus }] =
    useDisclosure(false);
  const [deleteApplicationOpened, { open: openDeleteApplication, close: closeDeleteApplication }] =
    useDisclosure(false);
  const [editApplicationOpened, { open: openEditApplication, close: closeEditApplication }] = useDisclosure(false);

  const isUpdatedToday =
    application.history.length > 1 &&
    dayjs(application.history[application.history.length - 1].date).isSame(dayjs(), 'day');

  const isAddedToday = dayjs(application.history[0].date).isSame(dayjs(), 'day');

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

      <Card padding="md" shadow="xs" radius="md" withBorder h="100%">
        <Stack>
          <Group justify="space-between" align="flex-start">
            <Skeleton radius="sm" visible={loading} w={48}>
              <Box
                ref={boxRef}
                w={48}
                h={48}
                bdrs="sm"
                bg={GeoPattern.generate(application.companyName).toDataUrl()}
                className="animate__animated"
                onClick={() => boxRef.current && boxRef.current.classList.add('animate__pulse')}
                onAnimationEnd={() => boxRef.current && boxRef.current.classList.remove('animate__pulse')}
              />
            </Skeleton>

            {!loading && (
              <Group>
                {(isUpdatedToday || isAddedToday) && (
                  <Badge color="yellow" autoContrast size="sm">
                    {isUpdatedToday ? 'Updated today' : 'Added today'}
                  </Badge>
                )}

                <Menu
                  withinPortal
                  position="left-start"
                  shadow="xl"
                  offset={-28}
                  zIndex={90}
                  transitionProps={{
                    transition: {
                      in: { opacity: 1, transform: 'scale(1)' },
                      out: { opacity: 0, transform: 'scale(0)' },
                      common: { transformOrigin: 'top right' },
                      transitionProperty: 'opacity, transform'
                    },
                    duration: 200
                  }}
                >
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
                      leftSection={<IconStatusChange size={16} stroke={1.5} />}
                      onClick={() => setTimeout(openCreateApplicationStatus, 0)}
                    >
                      Update status
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                      leftSection={<IconPencil size={16} stroke={1.5} />}
                      onClick={() => setTimeout(openEditApplication, 0)}
                    >
                      Edit application
                    </Menu.Item>

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
            )}
          </Group>

          <Box mt="calc(var(--mantine-spacing-xs) / 2">
            <Skeleton radius="xs" visible={loading}>
              <Text className="max-content-width" title={application.companyName} size="sm">
                <Highlight span color="yellow" highlight={highlight}>
                  {application.companyName}
                </Highlight>
              </Text>
            </Skeleton>
          </Box>

          <Skeleton radius="xs" visible={loading}>
            <Text className="max-content-width" title={application.jobTitle}>
              <Highlight span color="yellow" highlight={highlight}>
                {application.jobTitle}
              </Highlight>
            </Text>
          </Skeleton>

          <Skeleton radius="xs" visible={loading} w="75%">
            <Group gap="sm">
              <Box
                w={8}
                h={32}
                bdrs="xs"
                bg={Object.values(APPLICATION_STATUS).find(status => status.label === application.status)?.color}
              />

              <Box>
                <Text className="max-content-width" size="sm" title={application.status}>
                  {application.status}
                </Text>

                <Text c="dimmed" size="xs">
                  {formatDate(application.date)}
                </Text>
              </Box>
            </Group>
          </Skeleton>
        </Stack>
      </Card>
    </>
  );
};

export default Application;
