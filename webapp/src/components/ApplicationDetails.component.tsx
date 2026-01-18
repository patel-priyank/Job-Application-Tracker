import { ActionIcon, Anchor, Button, Group, Menu, Modal, Stack, Text, Timeline } from '@mantine/core';

import { IconDots, IconExternalLink, IconPencil, IconTrash } from '@tabler/icons-react';

import type { JobApplication } from '../contexts/ApplicationContext';

import { APPLICATION_STATUS } from '../utils/constants';
import { formatDate } from '../utils/functions';

const ApplicationDetails = ({
  opened,
  onClose,
  application
}: {
  opened: boolean;
  onClose: () => void;
  application: JobApplication | null;
}) => {
  return (
    <Modal opened={opened} onClose={onClose} title={application?.companyName} overlayProps={{ blur: 2 }} centered>
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
              <Group gap="xs">
                <Text c="dimmed" size="sm">
                  {formatDate(item.date)}
                </Text>

                <Menu withinPortal position="top-start" shadow="xl">
                  <Menu.Target>
                    <ActionIcon size="sm" variant="light" color="gray">
                      <IconDots size={16} stroke={1.5} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconPencil size={16} stroke={1.5} />} onClick={() => {}}>
                      Edit
                    </Menu.Item>

                    <Menu.Item
                      leftSection={<IconTrash size={16} stroke={1.5} />}
                      color="red"
                      disabled={application?.history.length === 1}
                      onClick={() => {}}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
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
  );
};

export default ApplicationDetails;
