import { ActionIcon, Anchor, Button, Group, Menu, Modal, Stack, Text, Timeline } from '@mantine/core';

import { IconDots, IconExternalLink, IconPencil, IconTrash } from '@tabler/icons-react';

import type { JobApplication } from '../contexts/ApplicationContext';

import { APPLICATION_STATUS } from '../utils/constants';
import { formatDate } from '../utils/functions';

const ApplicationHistory = ({
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
        <Text c="dimmed">{application?.jobTitle}</Text>

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
            gap: '0.5ch',
            ...(application?.link
              ? {}
              : {
                  color: 'var(--mantine-color-disabled-color)',
                  opacity: 0.6,
                  cursor: 'not-allowed'
                })
          }}
        >
          Track application <IconExternalLink size={16} stroke={1.5} />
        </Anchor>

        <Timeline bulletSize={16} lineWidth={2} mt="xs">
          {application?.history.map((item, index) => (
            <Timeline.Item
              key={index}
              title={item.status}
              c={Object.values(APPLICATION_STATUS).find(status => status.label === item.status)?.color}
            >
              <Group gap="xs">
                <Text c="dimmed" size="sm">
                  {formatDate(item.date)}
                </Text>

                <Menu withinPortal position="top-start" shadow="xl">
                  <Menu.Target>
                    <ActionIcon size="sm" variant="subtle" color="gray">
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

export default ApplicationHistory;
