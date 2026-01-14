import { Accordion, ActionIcon, Avatar, Button, Card, Divider, Grid, Group, Image, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { IconAlertTriangle, IconLogout, IconPencil } from '@tabler/icons-react';

import { useAuthContext } from '../hooks/useAuthContext';

import DeleteAccount from '../components/DeleteAccount.component';
import DeleteApplications from '../components/DeleteApplications.component';
import EditEmail from '../components/EditEmail.component';
import EditEmailsUsed from '../components/EditEmailsUsed.component';
import EditName from '../components/EditName.component';
import EditPassword from '../components/EditPassword.component';
import FloatingActionButton from '../components/FloatingActionButton.component';
import SignIn from '../components/SignIn.component';
import SignOut from '../components/SignOut.component';
import SignUp from '../components/SignUp.component';

import { formatDate } from '../utils/functions';

import signInImage from '../assets/sign-in.png';
import signUpImage from '../assets/sign-up.png';

const Account = () => {
  const { user } = useAuthContext();

  const [deleteAccOpened, { open: openDeleteAcc, close: closeDeleteAcc }] = useDisclosure(false);
  const [deleteAppsOpened, { open: openDeleteApps, close: closeDeleteApps }] = useDisclosure(false);
  const [editEmailOpened, { open: openEditEmail, close: closeEditEmail }] = useDisclosure(false);
  const [editNameOpened, { open: openEditName, close: closeEditName }] = useDisclosure(false);
  const [editPasswordOpened, { open: openEditPassword, close: closeEditPassword }] = useDisclosure(false);
  const [editEmailsUsedOpened, { open: openEditEmailsUsed, close: closeEditEmailsUsed }] = useDisclosure(false);
  const [signInOpened, { open: openSignIn, close: closeSignIn }] = useDisclosure(false);
  const [signOutOpened, { open: openSignOut, close: closeSignOut }] = useDisclosure(false);
  const [signUpOpened, { open: openSignUp, close: closeSignUp }] = useDisclosure(false);

  return (
    <>
      <DeleteAccount opened={deleteAccOpened} onClose={closeDeleteAcc} />
      <DeleteApplications opened={deleteAppsOpened} onClose={closeDeleteApps} />
      <EditEmail opened={editEmailOpened} onClose={closeEditEmail} />
      <EditEmailsUsed opened={editEmailsUsedOpened} onClose={closeEditEmailsUsed} />
      <EditName opened={editNameOpened} onClose={closeEditName} />
      <EditPassword opened={editPasswordOpened} onClose={closeEditPassword} />
      <SignIn opened={signInOpened} onClose={closeSignIn} />
      <SignOut opened={signOutOpened} onClose={closeSignOut} />
      <SignUp opened={signUpOpened} onClose={closeSignUp} />

      <Group justify="space-between">
        <Text component="h2" size="lg" fw="500">
          Account
        </Text>
      </Group>

      <Divider my="md" />

      {!user && (
        <Grid justify="center">
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card padding="md" shadow="md" radius="md" withBorder h="100%">
              <Image src={signUpImage} alt="" h={{ base: 240, md: 360 }} p="md" style={{ objectFit: 'contain' }} />

              <Text my="md" c="dimmed" flex={1}>
                New here? Create an account and start tracking your job applications. It's free and takes only a minute.
              </Text>

              <Group>
                <Button onClick={openSignUp}>Sign up</Button>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Card padding="md" shadow="md" radius="md" withBorder h="100%">
              <Image src={signInImage} alt="" h={{ base: 240, md: 360 }} p="md" style={{ objectFit: 'contain' }} />

              <Text my="md" c="dimmed" flex={1}>
                Already have an account? Sign in to access your account. All your job applications are stored in one
                place.
              </Text>

              <Group>
                <Button onClick={openSignIn}>Sign in</Button>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {user && (
        <>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }}>
              <Card padding="md" shadow="md" radius="md" withBorder h="100%">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text>Name</Text>

                    <ActionIcon variant="light" onClick={openEditName}>
                      <IconPencil size={20} stroke={1.5} />
                    </ActionIcon>
                  </Group>

                  <Text c="dimmed" truncate="end" title={user.name}>
                    {user.name}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }}>
              <Card padding="md" shadow="md" radius="md" withBorder h="100%">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text>Email</Text>

                    <ActionIcon variant="light" onClick={openEditEmail}>
                      <IconPencil size={20} stroke={1.5} />
                    </ActionIcon>
                  </Group>

                  <Text c="dimmed" truncate="end" title={user.email}>
                    {user.email}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }}>
              <Card padding="md" shadow="md" radius="md" withBorder h="100%">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text>Password</Text>

                    <ActionIcon variant="light" onClick={openEditPassword}>
                      <IconPencil size={20} stroke={1.5} />
                    </ActionIcon>
                  </Group>

                  <Text c="dimmed">Updated on {formatDate(user.passwordUpdatedAt)}</Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }}>
              <Card padding="md" shadow="md" radius="md" withBorder h="100%">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text>Emails Used</Text>

                    <ActionIcon variant="light" onClick={openEditEmailsUsed}>
                      <IconPencil size={20} stroke={1.5} />
                    </ActionIcon>
                  </Group>

                  <Text c="dimmed">
                    {user.emailsUsed.length} email{user.emailsUsed.length !== 1 && 's'} used
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          <Accordion variant="separated" radius="lg" mt="lg">
            <Accordion.Item value="danger">
              <Accordion.Control>
                <Group wrap="nowrap">
                  <Avatar color="red" radius="xl" size="md">
                    <IconAlertTriangle size={20} stroke={1.5} />
                  </Avatar>
                  <div>
                    <Text>Danger zone</Text>
                    <Text size="sm" c="dimmed">
                      Irreversible actions ahead. Please proceed with caution.
                    </Text>
                  </div>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }}>
                    <Card padding="md" shadow="md" radius="md" withBorder h="100%" bg="transparent">
                      <Stack gap="md" align="flex-start">
                        <Text>Job Applications</Text>

                        <Text c="dimmed">
                          Tracking {user.applicationsCount} application{user.applicationsCount !== 1 && 's'}
                        </Text>

                        <Button
                          variant="outline"
                          size="sm"
                          color="red"
                          onClick={openDeleteApps}
                          disabled={user.applicationsCount === 0}
                        >
                          Delete applications
                        </Button>
                      </Stack>
                    </Card>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6, lg: 4, xl: 3 }}>
                    <Card padding="md" shadow="md" radius="md" withBorder h="100%" bg="transparent">
                      <Stack gap="md" align="flex-start">
                        <Text>Account</Text>

                        <Text c="dimmed">Member since {formatDate(user.createdAt)}</Text>

                        <Button variant="outline" size="sm" color="red" onClick={openDeleteAcc}>
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
      )}
    </>
  );
};

export default Account;
