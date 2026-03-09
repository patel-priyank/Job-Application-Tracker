import { Accordion, ActionIcon, Avatar, Box, Button, Card, Grid, Group, Stack, Text } from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';

import { IconAlertTriangle, IconLogout, IconPencil } from '@tabler/icons-react';

import { useAuthContext } from '../hooks/useAuthContext';

import DeleteAccount from '../components/DeleteAccount.component';
import DeleteApplications from '../components/DeleteApplications.component';
import EditEmail from '../components/EditEmail.component';
import EditName from '../components/EditName.component';
import EditPassword from '../components/EditPassword.component';
import EditSuggestedEmails from '../components/EditSuggestedEmails.component';
import FloatingActionButton from '../components/FloatingActionButton.component';
import SignOut from '../components/SignOut.component';

import { formatDate, getSortedSuggestedEmails } from '../utils/functions';

const Account = () => {
  const { user } = useAuthContext();

  const [deleteAccountOpened, { open: openDeleteAccount, close: closeDeleteAccount }] = useDisclosure(false);
  const [deleteApplicationsOpened, { open: openDeleteApplications, close: closeDeleteApplications }] =
    useDisclosure(false);
  const [editEmailOpened, { open: openEditEmail, close: closeEditEmail }] = useDisclosure(false);
  const [editNameOpened, { open: openEditName, close: closeEditName }] = useDisclosure(false);
  const [editPasswordOpened, { open: openEditPassword, close: closeEditPassword }] = useDisclosure(false);
  const [editSuggestedEmailsOpened, { open: openEditSuggestedEmails, close: closeEditSuggestedEmails }] =
    useDisclosure(false);
  const [signOutOpened, { open: openSignOut, close: closeSignOut }] = useDisclosure(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <DeleteAccount opened={deleteAccountOpened} onClose={closeDeleteAccount} />
      <DeleteApplications opened={deleteApplicationsOpened} onClose={closeDeleteApplications} />
      <EditEmail opened={editEmailOpened} onClose={closeEditEmail} />
      <EditName opened={editNameOpened} onClose={closeEditName} />
      <EditPassword opened={editPasswordOpened} onClose={closeEditPassword} />
      <EditSuggestedEmails opened={editSuggestedEmailsOpened} onClose={closeEditSuggestedEmails} />
      <SignOut opened={signOutOpened} onClose={closeSignOut} />

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, lg: 4, xl: 3 }}>
          <Card padding="md" shadow="xs" radius="md" withBorder h="100%">
            <Stack>
              <Group justify="space-between">
                <Text c="dimmed">Name</Text>

                <ActionIcon variant="light" onClick={openEditName}>
                  <IconPencil size={20} stroke={1.5} />
                </ActionIcon>
              </Group>

              <Text className="max-content-width" title={user.name}>
                {user.name}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 4, xl: 3 }}>
          <Card padding="md" shadow="xs" radius="md" withBorder h="100%">
            <Stack>
              <Group justify="space-between">
                <Text c="dimmed">Email</Text>

                <ActionIcon variant="light" onClick={openEditEmail}>
                  <IconPencil size={20} stroke={1.5} />
                </ActionIcon>
              </Group>

              <Text className="max-content-width" title={user.email}>
                {user.email}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 4, xl: 3 }}>
          <Card padding="md" shadow="xs" radius="md" withBorder h="100%">
            <Stack>
              <Group justify="space-between">
                <Text c="dimmed">Password</Text>

                <ActionIcon variant="light" onClick={openEditPassword}>
                  <IconPencil size={20} stroke={1.5} />
                </ActionIcon>
              </Group>

              <Text>Updated on {formatDate(user.passwordUpdatedAt)}</Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 4, xl: 3 }}>
          <Card padding="md" shadow="xs" radius="md" withBorder h="100%">
            <Stack>
              <Group justify="space-between">
                <Text c="dimmed">Suggested Emails</Text>

                <ActionIcon variant="light" onClick={openEditSuggestedEmails}>
                  <IconPencil size={20} stroke={1.5} />
                </ActionIcon>
              </Group>

              <Text>
                {getSortedSuggestedEmails(user.suggestedEmails, user.email).length} email
                {getSortedSuggestedEmails(user.suggestedEmails, user.email).length !== 1 && 's'}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Accordion variant="separated" radius="lg" mt="lg">
        <Accordion.Item value="danger">
          <Accordion.Control>
            <Group mr="md" wrap="nowrap">
              <Avatar color="red" radius="xl" size="md">
                <IconAlertTriangle size={20} stroke={1.5} />
              </Avatar>
              <Box>
                <Text>Danger Zone</Text>
                <Text size="sm" c="dimmed">
                  Irreversible actions ahead. Proceed with caution.
                </Text>
              </Box>
            </Group>
          </Accordion.Control>

          <Accordion.Panel>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, lg: 4, xl: 3 }}>
                <Card padding="md" shadow="xs" radius="md" withBorder h="100%">
                  <Stack align="flex-start">
                    <Text c="dimmed">Job Applications</Text>

                    <Text>
                      Tracking {user.applicationsCount} application{user.applicationsCount !== 1 && 's'}
                    </Text>

                    <Button
                      variant="outline"
                      size="sm"
                      color="red"
                      onClick={openDeleteApplications}
                      disabled={user.applicationsCount === 0}
                    >
                      Delete applications
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, lg: 4, xl: 3 }}>
                <Card padding="md" shadow="xs" radius="md" withBorder h="100%">
                  <Stack align="flex-start">
                    <Text c="dimmed">Account</Text>

                    <Text>Member since {formatDate(user.createdAt)}</Text>

                    <Button variant="outline" size="sm" color="red" onClick={openDeleteAccount}>
                      Delete account
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <FloatingActionButton icon={IconLogout} label="Sign out" onClick={openSignOut} />
    </>
  );
};

export default Account;
