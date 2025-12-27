import { Link } from 'react-router-dom';

import { ActionIcon, Affix, Button, Card, Divider, Grid, Group, Image, Menu, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { IconDots, IconFile, IconFilter, IconJson } from '@tabler/icons-react';

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useAuthContext } from '../hooks/useAuthContext';

import Application from '../components/Application.component';
import CreateApplication from '../components/CreateApplication.component';

import authenticationImage from '../assets/authentication.png';
import createApplicationImage from '../assets/create-application.png';

const Applications = () => {
  const { applications } = useApplicationContext();
  const { user } = useAuthContext();

  const [createAppOpened, { open: openCreateApp, close: closeCreateApp }] = useDisclosure(false);

  return (
    <>
      <CreateApplication opened={createAppOpened} onClose={closeCreateApp} />

      <Group justify="space-between">
        <Text component="h2" size="lg" fw="500">
          Applications
        </Text>

        {user && applications.length > 0 && (
          <Menu withinPortal position="bottom-end" shadow="xl">
            <Menu.Target>
              <ActionIcon variant="light">
                <IconDots size={16} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<IconFilter size={16} stroke={1.5} />} onClick={() => {}}>
                View options
              </Menu.Item>

              <Menu.Item leftSection={<IconJson size={16} stroke={1.5} />} onClick={() => {}}>
                Export applications
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <Divider my="md" />

      {!user && (
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card padding="md" shadow="md" radius="md" withBorder h="100%">
              <Image
                src={authenticationImage}
                alt=""
                h={{ base: 240, md: 360 }}
                p="md"
                style={{ objectFit: 'contain' }}
              />

              <Text my="md" c="dimmed" flex={1}>
                Get started tracking your job applications by creating an account or signing in. It only takes a minute!
              </Text>

              <Group>
                <Button component={Link} to="/account">
                  Go to Account
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {user && applications.length === 0 && (
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card padding="md" shadow="md" radius="md" withBorder h="100%">
              <Image
                src={createApplicationImage}
                alt=""
                h={{ base: 240, md: 360 }}
                p="md"
                style={{ objectFit: 'contain' }}
              />

              <Text my="md" c="dimmed" flex={1}>
                No applications yet? Let's kick things off by adding your first job application to start tracking your
                progress.
              </Text>

              <Group>
                <Button onClick={openCreateApp}>Create application</Button>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {user && applications.length > 0 && (
        <>
          <Grid>
            {applications.map(application => (
              <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }} key={application._id}>
                <Application application={application} />
              </Grid.Col>
            ))}
          </Grid>

          <Affix position={{ bottom: 16, right: 16 }} zIndex={100}>
            <Button hiddenFrom="sm" size="md" radius="md" className="affix-shadow" onClick={openCreateApp}>
              <IconFile size={20} stroke={2} />
            </Button>

            <Button
              visibleFrom="sm"
              leftSection={<IconFile size={20} stroke={2} />}
              size="md"
              radius="md"
              className="affix-shadow"
              onClick={openCreateApp}
            >
              Create application
            </Button>
          </Affix>
        </>
      )}
    </>
  );
};

export default Applications;
